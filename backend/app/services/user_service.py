from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.repositories.user_repo import UserRepository
from app.schemas.user import AssessmentRequest, UserProfileUpdate


class UserService:
    """User profile business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.user_repo = UserRepository(db)

    async def get_profile(self, user: dict) -> dict:
        """Get formatted user profile."""
        return self._format_user(user)

    async def update_profile(self, user_id: str, data: UserProfileUpdate) -> dict:
        """Update user profile fields."""
        update_data = {}

        if data.name is not None:
            update_data["name"] = data.name

        # Build profile update
        profile_fields = {}
        for field in [
            "age", "height_cm", "weight_kg", "fitness_level",
            "fitness_goal", "available_time_minutes",
            "available_equipment", "preferred_workout_days",
        ]:
            value = getattr(data, field, None)
            if value is not None:
                profile_fields[field] = value if not hasattr(value, 'value') else value.value

        if profile_fields:
            for key, val in profile_fields.items():
                update_data[f"profile.{key}"] = val
                # Handle enum lists
                if isinstance(val, list):
                    update_data[f"profile.{key}"] = [
                        v.value if hasattr(v, 'value') else v for v in val
                    ]

        user = await self.user_repo.update(user_id, update_data)
        return self._format_user(user)

    async def submit_assessment(self, user_id: str, data: AssessmentRequest) -> dict:
        """Submit fitness assessment and create user profile."""
        profile_data = {
            "age": data.age,
            "height_cm": data.height_cm,
            "weight_kg": data.weight_kg,
            "fitness_level": data.fitness_level.value,
            "fitness_goal": data.fitness_goal.value,
            "workout_experience_months": data.workout_experience_months,
            "available_time_minutes": data.available_time_minutes,
            "available_equipment": [e.value for e in data.available_equipment],
            "preferred_workout_days": [d.value for d in data.preferred_workout_days],
            "has_medical_concerns": data.has_medical_concerns,
            "medical_notes": data.medical_notes,
        }

        user = await self.user_repo.update_profile(user_id, profile_data)
        return self._format_user(user)

    def _format_user(self, user: dict) -> dict:
        """Format user for response."""
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "avatar_url": user.get("avatar_url"),
            "profile": user.get("profile"),
            "assessment_completed": user.get("assessment_completed", False),
            "created_at": user.get("created_at"),
        }
