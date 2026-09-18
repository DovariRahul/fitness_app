from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db, get_current_user
from app.schemas.user import AssessmentRequest, UserProfileUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile")
@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "avatar_url": current_user.get("avatar_url"),
        "profile": current_user.get("profile"),
        "assessment_completed": current_user.get("assessment_completed", False),
        "created_at": current_user.get("created_at"),
    }


@router.put("/profile")
async def update_profile(
    data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update the current user's profile."""
    service = UserService(db)
    return await service.update_profile(str(current_user["_id"]), data)


@router.post("/assessment")
async def submit_assessment(
    data: AssessmentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit fitness assessment and create user profile."""
    service = UserService(db)
    return await service.submit_assessment(str(current_user["_id"]), data)
