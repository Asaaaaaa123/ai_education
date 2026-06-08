"""
Authentication API — identity is handled by Clerk on the client.
These routes only expose profile + verification for the SPA.
"""
import logging
from typing import Dict

from fastapi import APIRouter, HTTPException, Depends

import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from auth import UserResponse, get_current_user
from user_data import get_user_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_payload(user: UserResponse) -> Dict:
    return user.model_dump() if hasattr(user, "model_dump") else user.dict()


@router.get("/me", response_model=Dict)
async def get_current_user_info(user: UserResponse = Depends(get_current_user)):
    """Current user + lightweight stats (Clerk JWT required)."""
    try:
        user_data = get_user_data(user.id)
        return {
            "success": True,
            "data": {
                "user": _user_payload(user),
                "stats": {
                    "children_count": len(user_data.get("children", [])),
                    "test_results_count": len(user_data.get("test_results", [])),
                    "plans_count": len(user_data.get("training_plans", [])),
                },
            },
        }
    except Exception as e:
        logger.error("get /me failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {e!s}") from e


@router.get("/verify", response_model=Dict)
async def verify_token(user: UserResponse = Depends(get_current_user)):
    """Alias used by the SPA to confirm the Bearer token is valid."""
    return {
        "success": True,
        "valid": True,
        "data": {"user_id": user.id, "email": user.email},
    }
