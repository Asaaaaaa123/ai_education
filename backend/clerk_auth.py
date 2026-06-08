"""
Verify Clerk session JWTs (Bearer token) using clerk-backend-api.

Requires CLERK_SECRET_KEY. Optional CLERK_AUTHORIZED_PARTIES (comma-separated origins)
for the authorized parties / azp check (e.g. http://localhost:3000).
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, Request, status

from auth import UserResponse

try:
    from clerk_backend_api.security import authenticate_request_async, AuthenticateRequestOptions
    from clerk_backend_api.security.types import AuthStatus

    _CLERK_SDK = True
except ImportError:
    _CLERK_SDK = False


def _authorized_parties() -> Optional[List[str]]:
    raw = os.environ.get("CLERK_AUTHORIZED_PARTIES", "").strip()
    if not raw:
        # Sensible dev defaults if unset
        return [
            "http://localhost:3333",
            "http://127.0.0.1:3333",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3456",
            "http://127.0.0.1:3456",
        ]
    return [p.strip() for p in raw.split(",") if p.strip()]


def _payload_to_user(payload: Dict[str, Any]) -> UserResponse:
    uid = str(payload.get("sub") or "")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk token (no sub)")

    email = str(payload.get("email") or "")
    fn = str(payload.get("first_name") or "").strip()
    ln = str(payload.get("last_name") or "").strip()
    name = (fn + " " + ln).strip()
    if not name:
        name = str(payload.get("username") or "").strip()
    if not name and email:
        name = email.split("@")[0]
    if not name:
        name = "User"

    iat = payload.get("iat")
    try:
        created_at = datetime.fromtimestamp(int(iat)).isoformat() if iat else datetime.now().isoformat()
    except (TypeError, ValueError, OSError):
        created_at = datetime.now().isoformat()

    return UserResponse(id=uid, email=email, name=name, created_at=created_at, last_login=None)


async def verify_clerk_request(request: Request) -> UserResponse:
    if not _CLERK_SDK:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clerk SDK not installed (pip install clerk-backend-api)",
        )
    secret = os.environ.get("CLERK_SECRET_KEY", "").strip()
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CLERK_SECRET_KEY is not configured on the server",
        )

    opts = AuthenticateRequestOptions(
        secret_key=secret,
        authorized_parties=_authorized_parties(),
    )
    state = await authenticate_request_async(request, opts)

    if state.status != AuthStatus.SIGNED_IN or not state.payload:
        msg = state.message or "Not authenticated"
        logger = logging.getLogger(__name__)
        logger.warning("Clerk auth failed: %s", msg)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=msg,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _payload_to_user(state.payload)
