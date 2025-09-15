from fastapi import APIRouter

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "insights"}