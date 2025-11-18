"""
User Data Management API Endpoints
"""
import logging
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

import sys
import os

# 添加backend目录到路径
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from auth import get_current_user, UserResponse, security
from user_data import (
    add_child, get_children, get_child,
    add_test_result, get_test_results,
    create_training_plan, get_training_plans, get_training_plan,
    update_daily_task, get_current_task
)
from utils.i18n import t

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-data", tags=["user-data"])

# ==================== Request/Response Models ====================

class ChildCreateRequest(BaseModel):
    name: str
    age: int
    gender: str
    birth_date: Dict


class TestResultRequest(BaseModel):
    child_id: str
    test_type: str
    results: Dict


class PlanCreateRequest(BaseModel):
    child_id: str
    plan_name: str
    start_date: str
    end_date: str
    daily_tasks: List[Dict]


class TaskUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


# ==================== Child Management Endpoints ====================

@router.post("/children", response_model=Dict)
async def create_child(
    request: ChildCreateRequest,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Add a child to user's profile"""
    try:
        logger.info(f"User {user.id} creating child: {request.name}")
        
        child_id = add_child(
            user.id,
            request.name,
            request.age,
            request.gender,
            request.birth_date
        )
        
        return {
            "success": True,
            "data": {
                "child_id": child_id,
                "child": {
                    "name": request.name,
                    "age": request.age,
                    "gender": request.gender
                }
            },
            "message": t("success.child_added", request=http_request)
        }
    except Exception as e:
        logger.error(f"创建孩子信息失败: {e}", exc_info=True)
        error_msg = t("error.create_child_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/children", response_model=Dict)
async def list_children(
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Get all children for current user"""
    try:
        children = get_children(user.id)
        
        return {
            "success": True,
            "data": {
                "children": children
            }
        }
    except Exception as e:
        logger.error(f"获取孩子列表失败: {e}")
        error_msg = t("error.get_children_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/children/{child_id}", response_model=Dict)
async def get_child_info(
    child_id: str,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Get specific child information"""
    try:
        child = get_child(user.id, child_id)
        
        if not child:
            error_msg = t("error.child_not_found", request=http_request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        return {
            "success": True,
            "data": {
                "child": child
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取孩子信息失败: {e}")
        error_msg = t("error.get_child_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


# ==================== Test Result Endpoints ====================

@router.post("/test-results", response_model=Dict)
async def create_test_result(
    request: TestResultRequest,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Add a test result"""
    try:
        logger.info(f"User {user.id} creating test result for child {request.child_id}")
        
        test_id = add_test_result(
            user.id,
            request.child_id,
            request.test_type,
            request.results
        )
        
        return {
            "success": True,
            "data": {
                "test_id": test_id,
                "test_type": request.test_type
            },
            "message": t("success.test_result_added", request=http_request)
        }
    except Exception as e:
        logger.error(f"创建测试结果失败: {e}", exc_info=True)
        error_msg = t("error.create_test_result_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/test-results", response_model=Dict)
async def list_test_results(
    child_id: Optional[str] = None,
    http_request: Request = None,
    user: UserResponse = Depends(get_current_user)
):
    """Get test results for user or specific child"""
    try:
        results = get_test_results(user.id, child_id)
        
        return {
            "success": True,
            "data": {
                "test_results": results
            }
        }
    except Exception as e:
        logger.error(f"获取测试结果失败: {e}")
        error_msg = t("error.get_test_results_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


# ==================== Training Plan Endpoints ====================

@router.post("/plans", response_model=Dict)
async def create_plan(
    request: PlanCreateRequest,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Create a training plan"""
    try:
        logger.info(f"User {user.id} creating plan for child {request.child_id}")
        
        plan_id = create_training_plan(
            user.id,
            request.child_id,
            request.plan_name,
            request.start_date,
            request.end_date,
            request.daily_tasks
        )
        
        return {
            "success": True,
            "data": {
                "plan_id": plan_id
            },
            "message": t("success.plan_created", request=http_request)
        }
    except Exception as e:
        logger.error(f"创建训练计划失败: {e}", exc_info=True)
        error_msg = t("error.create_plan_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/plans", response_model=Dict)
async def list_plans(
    child_id: Optional[str] = None,
    http_request: Request = None,
    user: UserResponse = Depends(get_current_user)
):
    """Get training plans for user or specific child"""
    try:
        plans = get_training_plans(user.id, child_id)
        
        return {
            "success": True,
            "data": {
                "plans": plans
            }
        }
    except Exception as e:
        logger.error(f"获取训练计划失败: {e}")
        error_msg = t("error.get_plans_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/plans/{plan_id}", response_model=Dict)
async def get_plan_info(
    plan_id: str,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Get specific training plan"""
    try:
        plan = get_training_plan(user.id, plan_id)
        
        if not plan:
            error_msg = t("error.plan_not_found", request=http_request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        return {
            "success": True,
            "data": {
                "plan": plan
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取训练计划失败: {e}")
        error_msg = t("error.get_plan_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.put("/plans/{plan_id}/tasks/{day}", response_model=Dict)
async def update_task(
    plan_id: str,
    day: int,
    request: TaskUpdateRequest,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Update a daily task"""
    try:
        logger.info(f"User {user.id} updating task day {day} in plan {plan_id}")
        
        update_daily_task(user.id, plan_id, day, request.status, request.notes)
        
        return {
            "success": True,
            "message": t("success.task_updated", request=http_request)
        }
    except Exception as e:
        logger.error(f"更新任务失败: {e}", exc_info=True)
        error_msg = t("error.update_task_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/current-task", response_model=Dict)
async def get_current_day_task(
    child_id: str,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """Get current day's task for a child"""
    try:
        current_task = get_current_task(user.id, child_id)
        
        if not current_task:
            return {
                "success": True,
                "data": None,
                "message": t("error.no_active_plan", request=http_request)
            }
        
        return {
            "success": True,
            "data": current_task
        }
    except Exception as e:
        logger.error(f"获取当前任务失败: {e}")
        error_msg = t("error.get_current_task_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")









