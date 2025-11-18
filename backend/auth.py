"""
Authentication and User Management System
"""
import os
import json
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

# Security scheme for JWT token
security = HTTPBearer()

# Data storage paths
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

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

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a random token"""
    return secrets.token_urlsafe(32)

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

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
            if verify_password(password, user_data.get('password_hash', '')):
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

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    user = get_user_from_session(token)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user










