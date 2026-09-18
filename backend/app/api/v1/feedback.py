from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db, get_current_user
from app.schemas.feedback import FeedbackRequest
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("")
async def submit_feedback(
    data: FeedbackRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit feedback for an incomplete workout."""
    service = FeedbackService(db)
    user_id = str(current_user["_id"])
    return await service.submit_feedback(user_id, data)


@router.get("")
async def get_feedback(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get recent feedback history."""
    service = FeedbackService(db)
    user_id = str(current_user["_id"])
    return await service.get_user_feedback(user_id)
