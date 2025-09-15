from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "auth"}
