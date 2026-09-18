from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db, get_current_user
from app.schemas.session import StartSessionRequest, UpdateExerciseRequest
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/start")
async def start_session(
    data: StartSessionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Start a new workout session."""
    service = SessionService(db)
    user_id = str(current_user["_id"])
    return await service.start_session(user_id, data.plan_id)


@router.put("/{session_id}/update")
async def update_exercise(
    session_id: str,
    data: UpdateExerciseRequest,
    _current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update an exercise's progress in a session."""
    service = SessionService(db)
    return await service.update_exercise(
        session_id=session_id,
        exercise_id=data.exercise_id,
        sets_completed=data.sets_completed,
        reps_completed=data.reps_completed,
        completed=data.completed,
    )


@router.post("/{session_id}/complete")
async def complete_session(
    session_id: str,
    _current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Mark a workout session as complete."""
    service = SessionService(db)
    return await service.complete_session(session_id)
