from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from app.deps import get_db, get_optional_user
from app.services.exercise_service import ExerciseService

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("")
async def get_exercises(
    target_muscle: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    equipment: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    _current_user: Optional[dict] = Depends(get_optional_user),
):
    """Get exercises with optional filters."""
    service = ExerciseService(db)
    return await service.get_exercises(
        target_muscle=target_muscle,
        difficulty=difficulty,
        equipment=equipment,
        category=category,
        search=search,
    )


@router.get("/{exercise_id}")
async def get_exercise(
    exercise_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _current_user: Optional[dict] = Depends(get_optional_user),
):
    """Get a single exercise with full details."""
    service = ExerciseService(db)
    return await service.get_exercise(exercise_id)
