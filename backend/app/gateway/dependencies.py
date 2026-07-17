import os
from fastapi import HTTPException, Depends, status, Security, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog
from supabase import create_client, Client

logger = structlog.get_logger()

# Use modern Anon Key Architecture instead of legacy JWT Secret
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

security = HTTPBearer()

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        logger.error("auth_failed_missing_supabase_credentials")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Supabase credentials not set."
        )
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

async def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    supabase = get_supabase_client()
    
    try:
        # Pass token directly to Supabase Auth Server for native verification
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token."
            )
        return response.user
    except Exception as e:
        logger.warning("auth_invalid_token", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token."
        )

async def require_admin(user = Depends(verify_jwt)):
    # Extract role from Supabase user metadata
    user_meta = user.user_metadata or {}
    role = user_meta.get("role")
    
    if role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    # The frontend expects the user dict in certain formats if logged, but main.py just logs sub
    return {"sub": user.id, "role": role}

async def verify_ws_jwt(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
        
    try:
        supabase = get_supabase_client()
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None
        return {"sub": response.user.id}
    except Exception as e:
        logger.warning("ws_auth_invalid_token", error=str(e))
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
