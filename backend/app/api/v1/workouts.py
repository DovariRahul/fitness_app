from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List

from app.deps import get_db, get_current_user
from app.schemas.workout import GenerateWorkoutRequest
from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("/today")
async def get_today_workout(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get today's workout plan (auto-generates if none exists)."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    profile = current_user.get("profile")
    plan = await service.get_today_workout(user_id, profile)

    if not plan:
        return {"message": "Please complete your fitness assessment first."}

    return plan


@router.post("/generate")
async def generate_workout(
    data: GenerateWorkoutRequest = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Generate a new personalized workout plan."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    profile = current_user.get("profile")

    if not profile:
        return {"message": "Please complete your fitness assessment first."}

    return await service.generate_workout(
        user_id=user_id,
        user_profile=profile,
        target_muscles=data.target_muscles if data else None,
        duration_override=data.duration_override if data else None,
        difficulty_override=data.difficulty_override if data else None,
    )


@router.get("/history")
async def get_workout_history(
    limit: int = Query(30, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get workout history."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    return await service.get_workout_history(user_id, limit, skip)


@router.get("/{plan_id}")
async def get_workout(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a specific workout plan by ID."""
    service = WorkoutService(db)
    plan = await service.get_workout_by_id(plan_id)
    if not plan:
        return {"error": "Workout not found"}
    return plan
