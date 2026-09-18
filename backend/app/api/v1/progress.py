from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db, get_current_user
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get overall fitness stats."""
    service = ProgressService(db)
    user_id = str(current_user["_id"])
    return await service.get_stats(user_id)


@router.get("/weekly")
async def get_weekly_progress(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get this week's daily progress."""
    service = ProgressService(db)
    user_id = str(current_user["_id"])
    return await service.get_weekly_progress(user_id)
