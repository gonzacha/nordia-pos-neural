from fastapi import APIRouter

router = APIRouter(prefix="/api/consent", tags=["consent"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "consent"}
