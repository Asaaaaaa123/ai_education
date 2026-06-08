"""
Authentication and User Management System
"""
import os
import json
import hashlib
import secrets
import logging
import bcrypt

from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import HTTPException, Request, status
from pydantic import BaseModel, EmailStr

from storage_paths import get_backend_data_dir

logger = logging.getLogger(__name__)

# Data storage paths (writable dir; falls back when ./data is root-owned, e.g. Docker host mount)
DATA_DIR = get_backend_data_dir()
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

# ==================== Data Models ====================

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str
    last_login: Optional[str] = None

# ==================== Storage Functions ====================

def load_users() -> Dict:
    """Load users from file"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading users: {e}")
            return {}
    return {}

def save_users(users: Dict):
    """Save users to file"""
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving users: {e}")
        raise HTTPException(status_code=500, detail="Failed to save user data")

def load_sessions() -> Dict:
    """Load sessions from file"""
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading sessions: {e}")
            return {}
    return {}

def save_sessions(sessions: Dict):
    """Save sessions to file"""
    try:
        with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(sessions, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to save session data")

# ==================== Security Functions ====================

def _prepare_bcrypt_secret(password: str) -> bytes:
    """
    Prepare password bytes for bcrypt's 72-byte limit.

    - <=72 bytes: use UTF-8 bytes directly.
    - >72 bytes: hash first (SHA-256) and bcrypt the digest marker payload.
      This avoids long-password collisions caused by bcrypt truncation.
    """
    raw = (password or "").encode("utf-8")
    if len(raw) <= 72:
        return raw
    digest = hashlib.sha256(raw).hexdigest().encode("ascii")
    return b"sha256$" + digest


def hash_password(password: str) -> str:
    """Bcrypt hash with explicit 72-byte normalization."""
    if len(password) > 200:
        raise HTTPException(status_code=400, detail="Password is too long")
    secret = _prepare_bcrypt_secret(password)
    return bcrypt.hashpw(secret, bcrypt.gensalt()).decode("utf-8")


def _legacy_sha256(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    """Generate a random token"""
    return secrets.token_urlsafe(32)


def verify_password(password: str, hashed: str) -> bool:
    """Verify bcrypt; fall back to legacy unsalted SHA-256 for migration."""
    if not hashed:
        return False
    if hashed.startswith("$2"):
        try:
            hashed_bytes = hashed.encode("utf-8")
            secret = _prepare_bcrypt_secret(password)
            if bcrypt.checkpw(secret, hashed_bytes):
                return True

            # Backward-compatibility: old bcrypt behavior for >72-byte inputs.
            raw = (password or "").encode("utf-8")
            if len(raw) > 72:
                return bcrypt.checkpw(raw[:72], hashed_bytes)
            return False
        except (ValueError, TypeError):
            return False
    return _legacy_sha256(password) == hashed


def _upgrade_legacy_password(users: Dict, user_id: str, plain: str, legacy_hash: str) -> None:
    if legacy_hash.startswith("$2"):
        return
    if _legacy_sha256(plain) != legacy_hash:
        return
    users[user_id]["password_hash"] = hash_password(plain)
    save_users(users)
    logger.info("Password hash upgraded to bcrypt for user_id=%s", user_id)

# ==================== User Management Functions ====================

def register_user(email: str, password: str, name: str) -> UserResponse:
    """Register a new user"""
    users = load_users()
    
    # Check if user already exists
    for user_id, user_data in users.items():
        if user_data.get('email') == email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    user_id = secrets.token_urlsafe(16)
    user_data = {
        'id': user_id,
        'email': email,
        'name': name,
        'password_hash': hash_password(password),
        'created_at': datetime.now().isoformat(),
        'last_login': None
    }
    
    users[user_id] = user_data
    save_users(users)
    
    logger.info(f"New user registered: {email}")
    
    return UserResponse(
        id=user_id,
        email=email,
        name=name,
        created_at=user_data['created_at'],
        last_login=None
    )

def authenticate_user(email: str, password: str) -> Optional[UserResponse]:
    """Authenticate user and return user info"""
    users = load_users()
    
    for user_id, user_data in users.items():
        if user_data.get('email') == email:
            stored = user_data.get('password_hash', '')
            if verify_password(password, stored):
                _upgrade_legacy_password(users, user_id, password, stored)
                # Update last login
                user_data['last_login'] = datetime.now().isoformat()
                save_users(users)
                
                logger.info(f"User authenticated: {email}")
                
                return UserResponse(
                    id=user_id,
                    email=email,
                    name=user_data.get('name', ''),
                    created_at=user_data.get('created_at', ''),
                    last_login=user_data['last_login']
                )
    
    return None

def create_session(user_id: str) -> str:
    """Create a new session for user"""
    sessions = load_sessions()
    token = generate_token()
    
    sessions[token] = {
        'user_id': user_id,
        'created_at': datetime.now().isoformat(),
        'expires_at': (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    save_sessions(sessions)
    logger.info(f"Session created for user: {user_id}")
    
    return token

def get_user_from_session(token: str) -> Optional[UserResponse]:
    """Get user from session token"""
    sessions = load_sessions()
    users = load_users()
    
    if token not in sessions:
        return None
    
    session_data = sessions[token]
    
    # Check if session expired
    expires_at = datetime.fromisoformat(session_data['expires_at'])
    if datetime.now() > expires_at:
        # Clean up expired session
        del sessions[token]
        save_sessions(sessions)
        return None
    
    # Get user data
    user_id = session_data['user_id']
    if user_id in users:
        user_data = users[user_id]
        return UserResponse(
            id=user_id,
            email=user_data.get('email', ''),
            name=user_data.get('name', ''),
            created_at=user_data.get('created_at', ''),
            last_login=user_data.get('last_login')
        )
    
    return None

def delete_session(token: str):
    """Delete a session"""
    sessions = load_sessions()
    if token in sessions:
        del sessions[token]
        save_sessions(sessions)

# ==================== Dependency Functions ====================

async def get_current_user(request: Request) -> UserResponse:
    """Authenticate via Clerk session JWT (Authorization: Bearer …)."""
    from clerk_auth import verify_clerk_request

    return await verify_clerk_request(request)


async def get_optional_current_user(request: Request) -> Optional[UserResponse]:
    """Optional Clerk auth (when no Bearer token, returns None)."""
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        return None
    try:
        from clerk_auth import verify_clerk_request

        return await verify_clerk_request(request)
    except HTTPException:
        return None











