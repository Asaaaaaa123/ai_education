"""
Authentication API Endpoints
"""
import logging
from typing import Dict
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials

import sys
import os

# 添加backend目录到路径
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from auth import (
    UserRegisterRequest, UserLoginRequest, UserResponse,
    register_user, authenticate_user, create_session, delete_session,
    get_current_user, security
)
from user_data import (
    get_user_data, get_children, get_child, add_child,
    get_test_results, add_test_result,
    get_training_plans, get_training_plan, create_training_plan,
    update_daily_task, get_current_task
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ==================== Authentication Endpoints ====================

@router.post("/register", response_model=Dict)
async def register(request: UserRegisterRequest):
    """Register a new user"""
    try:
        logger.info(f"收到注册请求: {request.email}")
        
        # Register user
        user = register_user(request.email, request.password, request.name)
        
        # Create session
        token = create_session(user.id)
        
        return {
            "success": True,
            "data": {
                "user": user.dict(),
                "token": token
            },
            "message": "Registration successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"注册失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=Dict)
async def login(request: UserLoginRequest):
    """Login user"""
    try:
        logger.info(f"收到登录请求: {request.email}")
        
        # Authenticate user
        user = authenticate_user(request.email, request.password)
        
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Create session
        token = create_session(user.id)
        
        return {
            "success": True,
            "data": {
                "user": user.dict(),
                "token": token
            },
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"登录失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/logout", response_model=Dict)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user"""
    try:
        token = credentials.credentials
        delete_session(token)
        
        return {
            "success": True,
            "message": "Logout successful"
        }
    except Exception as e:
        logger.error(f"登出失败: {e}")
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.get("/me", response_model=Dict)
async def get_current_user_info(user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    try:
        # Get user's data
        user_data = get_user_data(user.id)
        
        return {
            "success": True,
            "data": {
                "user": user.dict(),
                "stats": {
                    "children_count": len(user_data.get('children', [])),
                    "test_results_count": len(user_data.get('test_results', [])),
                    "plans_count": len(user_data.get('training_plans', []))
                }
            }
        }
    except Exception as e:
        logger.error(f"获取用户信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {str(e)}")


@router.get("/verify", response_model=Dict)
async def verify_token(user: UserResponse = Depends(get_current_user)):
    """Verify authentication token"""
    # If we get here without exception, token is valid
    return {
        "success": True,
        "valid": True,
        "data": {
            "user_id": user.id,
            "email": user.email
        }
    }

