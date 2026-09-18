from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime, timezone


class SessionRepository:
    """Data access layer for workout_sessions collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.workout_sessions

    async def create(self, session_data: dict) -> dict:
        """Insert a new workout session."""
        session_data["started_at"] = datetime.now(timezone.utc)
        session_data["finished_at"] = None
        session_data["total_duration_sec"] = 0
        session_data["completion_percentage"] = 0.0
        session_data["calories_burned"] = 0.0
        result = await self.collection.insert_one(session_data)
        session_data["_id"] = result.inserted_id
        return session_data

    async def find_by_id(self, session_id: str) -> Optional[dict]:
        """Find a session by ID."""
        return await self.collection.find_one({"_id": ObjectId(session_id)})

    async def update(self, session_id: str, update_data: dict) -> dict:
        """Update session data."""
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(session_id)},
            {"$set": update_data},
            return_document=True,
        )
        return result

    async def complete(self, session_id: str, completion_data: dict) -> dict:
        """Mark a session as complete."""
        completion_data["finished_at"] = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(session_id)},
            {"$set": completion_data},
            return_document=True,
        )
        return result

    async def find_by_user(
        self, user_id: str, limit: int = 30, skip: int = 0
    ) -> List[dict]:
        """Find session history for a user."""
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("started_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def find_recent(self, user_id: str, limit: int = 7) -> List[dict]:
        """Find the most recent sessions."""
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("started_at", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def count_completed(self, user_id: str) -> int:
        """Count completed sessions (with finish time set)."""
        return await self.collection.count_documents(
            {"user_id": user_id, "finished_at": {"$ne": None}}
        )
