from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime, timezone


class WorkoutRepository:
    """Data access layer for workout_plans collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.workout_plans

    async def create(self, plan_data: dict) -> dict:
        """Insert a new workout plan."""
        plan_data["created_at"] = datetime.now(timezone.utc)
        plan_data["is_completed"] = False
        result = await self.collection.insert_one(plan_data)
        plan_data["_id"] = result.inserted_id
        return plan_data

    async def find_by_id(self, plan_id: str) -> Optional[dict]:
        """Find a workout plan by ID."""
        return await self.collection.find_one({"_id": ObjectId(plan_id)})

    async def find_today(self, user_id: str, date_str: str) -> Optional[dict]:
        """Find today's workout plan for a user."""
        return await self.collection.find_one(
            {"user_id": user_id, "date": date_str}
        )

    async def find_by_user(
        self, user_id: str, limit: int = 30, skip: int = 0
    ) -> List[dict]:
        """Find workout history for a user."""
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("date", -1)
            .skip(skip)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def mark_completed(self, plan_id: str) -> dict:
        """Mark a workout plan as completed."""
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(plan_id)},
            {"$set": {"is_completed": True}},
            return_document=True,
        )
        return result

    async def count_user_workouts(self, user_id: str) -> int:
        """Count total workout plans for a user."""
        return await self.collection.count_documents({"user_id": user_id})

    async def count_completed(self, user_id: str) -> int:
        """Count completed workout plans."""
        return await self.collection.count_documents(
            {"user_id": user_id, "is_completed": True}
        )
