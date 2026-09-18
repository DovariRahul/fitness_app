from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.core.constants import FeedbackReason


class FeedbackRequest(BaseModel):
    """Feedback for an incomplete workout."""
    session_id: str
    plan_id: str
    completion_percentage: float = Field(..., ge=0, le=100)
    reason: FeedbackReason
    reason_details: Optional[str] = None
    difficulty_rating: int = Field(..., ge=1, le=5)


class FeedbackResponse(BaseModel):
    """Feedback returned to frontend."""
    id: str
    user_id: str
    session_id: str
    plan_id: str
    completion_percentage: float
    reason: str
    reason_details: Optional[str] = None
    difficulty_rating: int
    created_at: Optional[datetime] = None
