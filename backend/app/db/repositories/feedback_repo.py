from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime, timezone


class FeedbackRepository:
    """Data access layer for user_feedback collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.user_feedback

    async def create(self, feedback_data: dict) -> dict:
        """Insert new feedback."""
        feedback_data["created_at"] = datetime.now(timezone.utc)
        result = await self.collection.insert_one(feedback_data)
        feedback_data["_id"] = result.inserted_id
        return feedback_data

    async def find_by_user(
        self, user_id: str, limit: int = 10
    ) -> List[dict]:
        """Find recent feedback for a user."""
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def find_latest(self, user_id: str) -> Optional[dict]:
        """Find the most recent feedback for a user."""
        return await self.collection.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)],
        )

    async def find_by_session(self, session_id: str) -> Optional[dict]:
        """Find feedback for a specific session."""
        return await self.collection.find_one({"session_id": session_id})

    async def get_reason_stats(self, user_id: str) -> List[dict]:
        """Aggregate feedback reasons for a user."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": "$reason", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=20)
