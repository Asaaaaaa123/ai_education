"""
SpecialCare Connect — unified FastAPI application (primary entrypoint).

Authenticated family flows use `/api/children` for unified ChildProfile v2 storage (migration from legacy
flat `user_children` / `user_test_results`) and `/api/plans` for daily training tasks + progress.
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, model_validator

import assessment_store
from analysis_engine import RECOMMENDATIONS_EN, AssessmentData, EducationAnalyzer, run_full_analysis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from api import auth, user_data
    from api.plans import router as plans_router
    from api.children import router as children_router

    AUTH_AVAILABLE = True
except ImportError as e:
    logger.warning("Authentication modules not available: %s", e)
    AUTH_AVAILABLE = False

from auth import get_current_user, get_optional_current_user, UserResponse


def _allowed_cors_origins() -> List[str]:
    raw = os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3333,http://127.0.0.1:3333,http://localhost:3456,http://127.0.0.1:3456",
    )
    return [o.strip() for o in raw.split(",") if o.strip()]


class AssessmentRequest(BaseModel):
    """Incoming assessment payload (matches frontend; extra fields ignored)."""

    model_config = ConfigDict(extra="ignore")

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
    testResults: Optional[Dict[str, Any]] = None
    ageAdaptiveResults: Optional[Dict[str, Any]] = None
    userId: Optional[str] = None

    @model_validator(mode="after")
    def normalize_aliases(self) -> AssessmentRequest:
        if self.childTestResults is None and self.testResults is not None:
            object.__setattr__(self, "childTestResults", self.testResults)
        return self


class AssessmentResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str
    timestamp: str


class TrainingRequest(BaseModel):
    training_data: List[Dict[str, Any]]
    epochs: int = 50
    learning_rate: float = 0.001


education_analyzer = EducationAnalyzer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SpecialCare Connect API…")
    try:
        frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public")
        if os.path.exists(frontend_path):
            app.mount("/static", StaticFiles(directory=frontend_path), name="static")
            logger.info("Mounted /static from %s", frontend_path)
    except Exception as e:
        logger.warning("Static mount skipped: %s", e)

    model_path = os.path.join(os.path.dirname(__file__), "models", "education_model.pth")
    if os.path.exists(model_path):
        try:
            education_analyzer.load_model(model_path)
            logger.info("CNN weights loaded")
        except Exception as e:
            logger.warning("CNN load failed: %s", e)
    else:
        logger.info("No CNN checkpoint at %s — rule-based + optional model channel only", model_path)

    logger.info("API ready (CORS origins: %s)", _allowed_cors_origins())
    yield
    logger.info("Shutting down API…")


app = FastAPI(
    title="SpecialCare Connect API",
    description="Educational guidance and structured developmental assessments (not medical advice).",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*", "Authorization", "Content-Type", "X-Language", "Accept-Language"],
)

if AUTH_AVAILABLE:
    app.include_router(auth.router)
    app.include_router(user_data.router)
    app.include_router(children_router)
    app.include_router(plans_router)
    logger.info("Auth, children, and plans routers enabled")


@app.get("/")
async def root():
    return {
        "message": "SpecialCare Connect API",
        "version": "1.1.0",
        "status": "running",
        "model_loaded": education_analyzer.model is not None,
        "disclaimer": "Educational support only — not a licensed medical or clinical service.",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": education_analyzer.model is not None,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/analyze", response_model=AssessmentResponse)
async def analyze_assessment(request: AssessmentRequest):
    if not (request.childName or "").strip():
        raise HTTPException(status_code=422, detail="childName is required")
    try:
        payload = request.model_dump(mode="python")
        analysis_result = run_full_analysis(payload, education_analyzer)
        assessment_id = f"assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        assessment_store.save_assessment(
            assessment_id,
            payload,
            analysis_result,
            user_id=payload.get("userId"),
        )
        return AssessmentResponse(
            success=True,
            data={
                "assessment_id": assessment_id,
                "analysis": analysis_result,
                "child_name": request.childName,
                "timestamp": datetime.now().isoformat(),
            },
            message="Assessment analysis complete",
            timestamp=datetime.now().isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("analyze_assessment failed")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e!s}") from e


@app.get("/history")
async def get_assessment_history(
    limit: int = 10,
    user: UserResponse = Depends(get_current_user),
):
    """Assessment history for the authenticated user only."""
    try:
        limit = max(1, min(limit, 100))
        rows = assessment_store.list_assessments(limit=limit, user_id=user.id)
        total = assessment_store.count_assessments(user_id=user.id)
        return {
            "success": True,
            "data": rows,
            "total": total,
            "scope": "user",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("history failed")
        raise HTTPException(status_code=500, detail=f"History failed: {e!s}") from e


def train_model_task(request: TrainingRequest) -> None:
    try:
        training_data: List[tuple] = []
        for item in request.training_data:
            a = AssessmentData(**item["assessment"])
            label = int(item["label"])
            training_data.append((a, label))
        education_analyzer.train_model(training_data, epochs=request.epochs, learning_rate=request.learning_rate)
        out_path = os.path.join(os.path.dirname(__file__), "models", "education_model.pth")
        education_analyzer.save_model(out_path)
        logger.info("Model training finished")
    except Exception as e:
        logger.exception("train_model_task failed")


@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(train_model_task, request)
        return {"success": True, "message": "Training scheduled", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.exception("train endpoint failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/save-model")
async def save_model():
    try:
        out_path = os.path.join(os.path.dirname(__file__), "models", "education_model.pth")
        education_analyzer.save_model(out_path)
        return {"success": True, "message": "Model saved", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.exception("save_model failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/load-model")
async def load_model(model_path: str = "models/education_model.pth"):
    try:
        education_analyzer.load_model(model_path)
        return {"success": True, "message": "Model loaded", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.exception("load_model failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/model-status")
async def get_model_status():
    return {
        "success": True,
        "data": {
            "model_loaded": education_analyzer.model is not None,
            "vocab_size": len(education_analyzer.vocab),
            "recommendation_library_keys": len(RECOMMENDATIONS_EN),
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/statistics")
async def get_statistics(user: Optional[UserResponse] = Depends(get_optional_current_user)):
    try:
        agg = assessment_store.aggregate_statistics(user_id=user.id if user else None)
        return {
            "success": True,
            "data": {
                **agg,
                "model_loaded": education_analyzer.model is not None,
                "filtered_to_user": bool(user),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("statistics failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
