from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from app.db.repositories.exercise_repo import ExerciseRepository


class ExerciseService:
    """Exercise database business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.exercise_repo = ExerciseRepository(db)

    async def get_exercises(
        self,
        target_muscle: Optional[str] = None,
        difficulty: Optional[str] = None,
        equipment: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[dict]:
        """Get filtered exercises."""
        exercises = await self.exercise_repo.find_all(
            target_muscle=target_muscle,
            difficulty=difficulty,
            equipment=equipment,
            category=category,
            search=search,
        )
        return [self._format_exercise(e) for e in exercises]

    async def get_exercise(self, exercise_id: str) -> dict:
        """Get a single exercise by ID."""
        exercise = await self.exercise_repo.find_by_id(exercise_id)
        if not exercise:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found",
            )
        return self._format_exercise(exercise)

    def _format_exercise(self, exercise: dict) -> dict:
        """Format exercise for response."""
        return {
            "id": str(exercise["_id"]),
            "name": exercise["name"],
            "description": exercise.get("description", ""),
            "target_muscle": exercise.get("target_muscle", ""),
            "secondary_muscles": exercise.get("secondary_muscles", []),
            "difficulty": exercise.get("difficulty", ""),
            "equipment": exercise.get("equipment", "none"),
            "category": exercise.get("category", "strength"),
            "default_sets": exercise.get("default_sets", 3),
            "default_reps": exercise.get("default_reps"),
            "default_duration_sec": exercise.get("default_duration_sec"),
            "rest_time_sec": exercise.get("rest_time_sec", 60),
            "instructions": exercise.get("instructions", []),
            "common_mistakes": exercise.get("common_mistakes", []),
            "video_url": exercise.get("video_url"),
            "thumbnail_url": exercise.get("thumbnail_url"),
            "beginner_alternative_id": (
                str(exercise["beginner_alternative_id"])
                if exercise.get("beginner_alternative_id")
                else None
            ),
            "advanced_alternative_id": (
                str(exercise["advanced_alternative_id"])
                if exercise.get("advanced_alternative_id")
                else None
            ),
            "calories_per_minute": exercise.get("calories_per_minute", 5.0),
        }
