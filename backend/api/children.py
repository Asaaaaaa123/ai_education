"""
Primary ChildProfile API (unified v2) — used by the post–Clerk dashboard and ChildOnboardingWizard.

Replaces ad-hoc /api/plans/children for new clients; plans.py still syncs the same child_profile_service store.
All routes require Clerk JWT; data is scoped by token sub (user.id).
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from auth import UserResponse, get_current_user
import assessment_store
from child_profile_service import (
    append_test_result_record,
    create_child_profile,
    delete_child_profile,
    get_child_profile,
    list_child_profiles,
    patch_child_profile,
    set_assessment_snapshot,
    set_onboarding,
)
from analysis_engine import run_full_analysis
from models.plan_generator import TestResult
from dataclasses import asdict

from api.plans import PlanCreateRequest, TestResultRequest, run_plan_generation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/children", tags=["children"])


class BasicChildCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    age: int
    gender: str = ""
    birth_date: str = ""
    parent_name: str = ""
    child_condition: Optional[str] = None
    main_problems: Optional[List[str]] = None


class PatchChildBody(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    parent_name: Optional[str] = None
    child_condition: Optional[str] = None
    main_problems: Optional[List[str]] = None


class AssessmentPayload(BaseModel):
    """Minimal assessment body compatible with analysis_engine /analyze."""

    model_config = ConfigDict(extra="allow")

    childName: str
    gender: str = ""
    birthDate: Dict[str, Any] = {}
    assessmentDate: Dict[str, Any] = {}
    assessor: str = ""
    childAge: int = 0
    assessmentMode: str = ""
    ageGroup: str = ""
    motorSkills: Optional[Dict[str, Any]] = None
    cognitiveSkills: Optional[Dict[str, Any]] = None
    languageSkills: Optional[Dict[str, Any]] = None
    socialEmotional: Optional[Dict[str, Any]] = None
    dailyLiving: Optional[Dict[str, Any]] = None
    interactiveResults: Optional[Dict[str, Any]] = None
    parentObservations: Optional[str] = None
    concerns: Optional[str] = None
    strengths: Optional[str] = None
    childTestResults: Optional[Dict[str, Any]] = None


class GeneratePlanBody(BaseModel):
    plan_type: str = "weekly"


class OnboardingStepBody(BaseModel):
    step: int
    completed: bool = False


def _get_analyzer():
    from app import education_analyzer

    return education_analyzer


def _test_rows_for_plan(trs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows = []
    for tr in trs:
        rows.append(
            {
                "test_id": tr.get("test_id", f"legacy_{datetime.now().strftime('%Y%m%d%H%M%S')}"),
                "test_type": tr.get("test_type", "unknown"),
                "test_data": tr.get("test_data", {}),
                "score": float(tr.get("score", 0)),
                "performance_level": tr.get("performance_level", "average"),
                "timestamp": tr.get("timestamp", datetime.now().isoformat()),
            }
        )
    return rows


@router.get("", response_model=dict)
async def list_children(user: UserResponse = Depends(get_current_user)):
    profiles = list_child_profiles(user.id)
    return {"success": True, "data": {"children": profiles}}


@router.post("", response_model=dict)
async def create_child(body: BasicChildCreate, request: Request, user: UserResponse = Depends(get_current_user)):
    child_id = create_child_profile(user.id, body.model_dump(exclude_none=True))
    prof = get_child_profile(user.id, child_id)
    return {"success": True, "data": {"child": prof, "child_id": child_id}}


@router.get("/{child_id}", response_model=dict)
async def get_child(child_id: str, user: UserResponse = Depends(get_current_user)):
    prof = get_child_profile(user.id, child_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"success": True, "data": {"child": prof}}


@router.patch("/{child_id}", response_model=dict)
async def patch_child(child_id: str, body: PatchChildBody, user: UserResponse = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    prof = patch_child_profile(user.id, child_id, updates)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"success": True, "data": {"child": prof}}


@router.delete("/{child_id}", response_model=dict)
async def remove_child(child_id: str, user: UserResponse = Depends(get_current_user)):
    ok = delete_child_profile(user.id, child_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"success": True, "data": {"deleted": True, "child_id": child_id}}


@router.post("/{child_id}/assessment", response_model=dict)
async def save_child_assessment(
    child_id: str,
    payload: AssessmentPayload,
    http_request: Request,
    user: UserResponse = Depends(get_current_user),
):
    prof = get_child_profile(user.id, child_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")

    raw = payload.model_dump(mode="python")
    raw["userId"] = user.id

    analyzer = _get_analyzer()
    analysis = run_full_analysis(raw, analyzer)
    assessment_id = f"assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    assessment_store.save_assessment(assessment_id, raw, analysis, user_id=user.id)
    set_assessment_snapshot(user.id, child_id, raw, analysis, assessment_id)
    set_onboarding(user.id, child_id, 3, False)

    return {
        "success": True,
        "data": {
            "assessment_id": assessment_id,
            "analysis": analysis,
            "child_id": child_id,
        },
        "message": "Assessment saved on child profile",
    }


@router.post("/{child_id}/test-results", response_model=dict)
async def post_child_test_result(
    child_id: str,
    body: TestResultRequest,
    request: Request,
    user: UserResponse = Depends(get_current_user),
):
    if body.child_id != child_id:
        raise HTTPException(status_code=400, detail="child_id mismatch")
    prof = get_child_profile(user.id, child_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")

    result = TestResult(
        test_id=f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        child_id=child_id,
        test_type=body.test_type,
        test_data=body.test_data,
        score=body.score,
        performance_level=body.performance_level,
        timestamp=datetime.now().isoformat(),
    )
    append_test_result_record(user.id, child_id, asdict(result))
    set_onboarding(user.id, child_id, 4, False)

    return {
        "success": True,
        "data": {"test_id": result.test_id, "score": result.score, "performance_level": result.performance_level},
    }


@router.post("/{child_id}/generate-plan", response_model=dict)
async def generate_plan_for_child(
    child_id: str,
    body: GeneratePlanBody,
    http_request: Request,
    user: UserResponse = Depends(get_current_user),
):
    prof = get_child_profile(user.id, child_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")

    trs = prof.get("test_results") or []
    rows = _test_rows_for_plan(trs)
    req = PlanCreateRequest(child_id=child_id, plan_type=body.plan_type, test_results=rows)
    try:
        out = await run_plan_generation(user, req, http_request)
        set_onboarding(user.id, child_id, 5, True)
        return out
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate-plan failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{child_id}/onboarding-step", response_model=dict)
async def report_onboarding_step(
    child_id: str,
    body: OnboardingStepBody,
    user: UserResponse = Depends(get_current_user),
):
    prof = get_child_profile(user.id, child_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Child not found")
    set_onboarding(user.id, child_id, body.step, body.completed)
    return {
        "success": True,
        "data": {"child_id": child_id, "step": body.step, "completed": body.completed},
    }

