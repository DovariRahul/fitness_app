from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.core.constants import FitnessLevel, FitnessGoal, Equipment, WorkoutDay


class UserProfile(BaseModel):
    """Fitness profile embedded in user document."""
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_level: Optional[FitnessLevel] = None
    fitness_goal: Optional[FitnessGoal] = None
    workout_experience_months: Optional[int] = 0
    available_time_minutes: Optional[int] = 30
    available_equipment: List[Equipment] = [Equipment.NONE]
    preferred_workout_days: List[WorkoutDay] = []
    has_medical_concerns: bool = False
    medical_notes: Optional[str] = None


class UserRegister(BaseModel):
    """Registration request body."""
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class AssessmentRequest(BaseModel):
    """Fitness assessment submission."""
    age: int = Field(..., ge=13, le=100)
    height_cm: float = Field(..., ge=100, le=250)
    weight_kg: float = Field(..., ge=30, le=300)
    fitness_level: FitnessLevel
    fitness_goal: FitnessGoal
    workout_experience_months: int = Field(0, ge=0)
    available_time_minutes: int = Field(30, ge=10, le=120)
    available_equipment: List[Equipment] = [Equipment.NONE]
    preferred_workout_days: List[WorkoutDay] = []
    has_medical_concerns: bool = False
    medical_notes: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Profile update request."""
    name: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_level: Optional[FitnessLevel] = None
    fitness_goal: Optional[FitnessGoal] = None
    available_time_minutes: Optional[int] = None
    available_equipment: Optional[List[Equipment]] = None
    preferred_workout_days: Optional[List[WorkoutDay]] = None


class UserResponse(BaseModel):
    """User data returned to frontend."""
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None
    profile: Optional[UserProfile] = None
    assessment_completed: bool = False
    created_at: Optional[datetime] = None
