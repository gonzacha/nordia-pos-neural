from fastapi import APIRouter

router = APIRouter(prefix="/api/pos", tags=["pos"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "pos"}