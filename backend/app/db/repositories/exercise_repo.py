from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List


class ExerciseRepository:
    """Data access layer for exercises collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.exercises

    async def find_all(
        self,
        target_muscle: Optional[str] = None,
        difficulty: Optional[str] = None,
        equipment: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
    ) -> List[dict]:
        """Find exercises with optional filters."""
        query = {}

        if target_muscle:
            query["target_muscle"] = target_muscle
        if difficulty:
            query["difficulty"] = difficulty
        if equipment:
            query["equipment"] = equipment
        if category:
            query["category"] = category
        if search:
            query["name"] = {"$regex": search, "$options": "i"}

        cursor = self.collection.find(query).limit(limit)
        return await cursor.to_list(length=limit)

    async def find_by_id(self, exercise_id: str) -> Optional[dict]:
        """Find exercise by ID."""
        return await self.collection.find_one({"_id": ObjectId(exercise_id)})

    async def find_by_ids(self, exercise_ids: List[str]) -> List[dict]:
        """Find multiple exercises by their IDs."""
        object_ids = [ObjectId(eid) for eid in exercise_ids]
        cursor = self.collection.find({"_id": {"$in": object_ids}})
        return await cursor.to_list(length=len(exercise_ids))

    async def find_for_workout(
        self,
        equipment_list: List[str],
        difficulty: str,
        target_muscles: Optional[List[str]] = None,
        exclude_ids: Optional[List[str]] = None,
        limit: int = 10,
    ) -> List[dict]:
        """Find exercises suitable for a workout plan."""
        query = {
            "equipment": {"$in": equipment_list},
            "difficulty": {"$in": self._get_difficulty_range(difficulty)},
        }

        if target_muscles:
            query["target_muscle"] = {"$in": target_muscles}

        if exclude_ids:
            query["_id"] = {"$nin": [ObjectId(eid) for eid in exclude_ids]}

        cursor = self.collection.find(query).limit(limit)
        return await cursor.to_list(length=limit)

    async def count(self) -> int:
        """Count total exercises."""
        return await self.collection.count_documents({})

    async def insert_many(self, exercises: List[dict]):
        """Insert multiple exercises (for seeding)."""
        if exercises:
            await self.collection.insert_many(exercises)

    def _get_difficulty_range(self, level: str) -> List[str]:
        """Get acceptable difficulty levels based on user level."""
        if level == "beginner":
            return ["beginner"]
        elif level == "intermediate":
            return ["beginner", "intermediate"]
        else:
            return ["beginner", "intermediate", "advanced"]
