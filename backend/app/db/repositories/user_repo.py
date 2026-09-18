from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional
from datetime import datetime, timezone


class UserRepository:
    """Data access layer for users collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def create(self, user_data: dict) -> dict:
        """Insert a new user."""
        user_data["created_at"] = datetime.now(timezone.utc)
        user_data["updated_at"] = datetime.now(timezone.utc)
        user_data["assessment_completed"] = False
        user_data["avatar_url"] = None
        user_data["profile"] = None

        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data

    async def find_by_email(self, email: str) -> Optional[dict]:
        """Find user by email."""
        return await self.collection.find_one({"email": email})

    async def find_by_id(self, user_id: str) -> Optional[dict]:
        """Find user by ID."""
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def update_profile(self, user_id: str, profile_data: dict) -> dict:
        """Update user profile with fitness assessment data."""
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "profile": profile_data,
                    "assessment_completed": True,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            return_document=True,
        )
        return result

    async def update(self, user_id: str, update_data: dict) -> dict:
        """Update user fields."""
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True,
        )
        return result
