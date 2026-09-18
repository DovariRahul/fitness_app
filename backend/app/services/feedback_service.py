from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.repositories.feedback_repo import FeedbackRepository
from app.schemas.feedback import FeedbackRequest


class FeedbackService:
    """Feedback processing business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.feedback_repo = FeedbackRepository(db)

    async def submit_feedback(self, user_id: str, data: FeedbackRequest) -> dict:
        """Submit feedback for an incomplete workout."""
        feedback_data = {
            "user_id": user_id,
            "session_id": data.session_id,
            "plan_id": data.plan_id,
            "completion_percentage": data.completion_percentage,
            "reason": data.reason.value,
            "reason_details": data.reason_details,
            "difficulty_rating": data.difficulty_rating,
        }

        feedback = await self.feedback_repo.create(feedback_data)
        return self._format_feedback(feedback)

    async def get_user_feedback(self, user_id: str, limit: int = 10) -> list:
        """Get recent feedback for a user."""
        feedbacks = await self.feedback_repo.find_by_user(user_id, limit)
        return [self._format_feedback(f) for f in feedbacks]

    def _format_feedback(self, feedback: dict) -> dict:
        """Format feedback for response."""
        return {
            "id": str(feedback["_id"]),
            "user_id": feedback["user_id"],
            "session_id": feedback["session_id"],
            "plan_id": feedback["plan_id"],
            "completion_percentage": feedback["completion_percentage"],
            "reason": feedback["reason"],
            "reason_details": feedback.get("reason_details"),
            "difficulty_rating": feedback["difficulty_rating"],
            "created_at": feedback.get("created_at"),
        }
