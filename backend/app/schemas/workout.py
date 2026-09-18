from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WorkoutExercise(BaseModel):
    """An exercise within a workout plan."""
    exercise_id: str
    exercise_name: str
    sets: int
    reps: Optional[int] = None
    duration_sec: Optional[int] = None
    rest_time_sec: int = 60
    order: int


class WorkoutPlanResponse(BaseModel):
    """Workout plan returned to frontend."""
    id: str
    user_id: str
    date: str
    title: str
    description: str
    estimated_duration_min: int
    difficulty: str
    exercises: List[WorkoutExercise]
    is_completed: bool = False
    created_at: Optional[datetime] = None


class GenerateWorkoutRequest(BaseModel):
    """Request to generate a new workout plan."""
    target_muscles: Optional[List[str]] = None
    duration_override: Optional[int] = None
    difficulty_override: Optional[str] = None
