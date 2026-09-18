from pydantic import BaseModel
from typing import Optional, List
from app.core.constants import Difficulty, Equipment, ExerciseCategory, TargetMuscle


class ExerciseResponse(BaseModel):
    """Exercise data returned to frontend."""
    id: str
    name: str
    description: str
    target_muscle: str
    secondary_muscles: List[str] = []
    difficulty: str
    equipment: str
    category: str
    default_sets: int
    default_reps: Optional[int] = None
    default_duration_sec: Optional[int] = None
    rest_time_sec: int = 60
    instructions: List[str] = []
    common_mistakes: List[str] = []
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    beginner_alternative_id: Optional[str] = None
    advanced_alternative_id: Optional[str] = None
    calories_per_minute: float = 5.0


class ExerciseFilter(BaseModel):
    """Query parameters for filtering exercises."""
    target_muscle: Optional[TargetMuscle] = None
    difficulty: Optional[Difficulty] = None
    equipment: Optional[Equipment] = None
    category: Optional[ExerciseCategory] = None
    search: Optional[str] = None
