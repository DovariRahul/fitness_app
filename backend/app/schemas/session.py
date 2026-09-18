from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SessionExercise(BaseModel):
    """Exercise tracking within a session."""
    exercise_id: str
    exercise_name: str
    sets_completed: int = 0
    sets_total: int
    reps_completed: List[int] = []
    completed: bool = False


class StartSessionRequest(BaseModel):
    """Start a workout session from a plan."""
    plan_id: str


class UpdateExerciseRequest(BaseModel):
    """Update a specific exercise's progress in a session."""
    exercise_id: str
    sets_completed: int
    reps_completed: List[int] = []
    completed: bool = False


class SessionResponse(BaseModel):
    """Workout session returned to frontend."""
    id: str
    user_id: str
    plan_id: str
    date: Optional[datetime] = None
    exercises: List[SessionExercise]
    total_duration_sec: int = 0
    completion_percentage: float = 0.0
    calories_burned: float = 0.0
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
