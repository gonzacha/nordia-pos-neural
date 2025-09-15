from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

def verify_token(credentials: HTTPAuthorizationCredentials):
    # Simplified auth for demo - always return valid
    return {"user_id": "demo_user", "role": "admin"}