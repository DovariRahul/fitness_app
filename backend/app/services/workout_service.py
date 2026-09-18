import random
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from fastapi import HTTPException, status

from app.db.repositories.workout_repo import WorkoutRepository
from app.db.repositories.exercise_repo import ExerciseRepository
from app.db.repositories.feedback_repo import FeedbackRepository


# Workout title templates based on target muscles
WORKOUT_TITLES = {
    "chest": "Chest Power",
    "back": "Back Builder",
    "shoulders": "Shoulder Sculpt",
    "biceps": "Arms Day",
    "triceps": "Arms Day",
    "core": "Core Crusher",
    "quadriceps": "Leg Day",
    "hamstrings": "Leg Day",
    "glutes": "Glute Blaster",
    "calves": "Leg Day",
    "full_body": "Full Body Burn",
    "cardio": "Cardio Blast",
}

# Goal-to-muscle-group mapping
GOAL_MUSCLE_MAP = {
    "weight_loss": ["full_body", "cardio", "core", "quadriceps", "glutes"],
    "muscle_gain": ["chest", "back", "shoulders", "quadriceps", "biceps", "triceps"],
    "strength": ["chest", "back", "quadriceps", "shoulders", "core"],
    "endurance": ["cardio", "full_body", "core", "quadriceps"],
    "general_fitness": ["full_body", "cardio", "core", "chest", "back", "quadriceps"],
}

# Sets/reps by fitness level
LEVEL_CONFIG = {
    "beginner": {"sets": 3, "reps_range": (8, 10), "exercise_count": (4, 5)},
    "intermediate": {"sets": 3, "reps_range": (10, 12), "exercise_count": (5, 6)},
    "advanced": {"sets": 4, "reps_range": (12, 15), "exercise_count": (6, 7)},
}


class WorkoutService:
    """Workout generation and management business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.workout_repo = WorkoutRepository(db)
        self.exercise_repo = ExerciseRepository(db)
        self.feedback_repo = FeedbackRepository(db)

    async def get_today_workout(self, user_id: str, user_profile: dict) -> Optional[dict]:
        """Get today's workout plan, generating one if it doesn't exist."""
        today = date.today().isoformat()

        # Check if plan exists for today
        plan = await self.workout_repo.find_today(user_id, today)
        if plan:
            return self._format_plan(plan)

        # Auto-generate if no plan exists and assessment is completed
        if user_profile:
            plan = await self.generate_workout(user_id, user_profile)
            return plan

        return None

    async def generate_workout(
        self,
        user_id: str,
        user_profile: dict,
        target_muscles: Optional[List[str]] = None,
        duration_override: Optional[int] = None,
        difficulty_override: Optional[str] = None,
    ) -> dict:
        """Generate a personalized workout plan based on user profile and feedback history."""

        fitness_level = difficulty_override or user_profile.get("fitness_level", "beginner")
        fitness_goal = user_profile.get("fitness_goal", "general_fitness")
        available_time = duration_override or user_profile.get("available_time_minutes", 30)
        equipment = user_profile.get("available_equipment", ["none"])

        # Check recent feedback and adapt
        adaptation = await self._get_adaptation(user_id)
        if adaptation:
            fitness_level = adaptation.get("adjusted_level", fitness_level)
            available_time = adaptation.get("adjusted_time", available_time)

        # Get level config
        config = LEVEL_CONFIG.get(fitness_level, LEVEL_CONFIG["beginner"])
        exercise_count = random.randint(*config["exercise_count"])

        # Determine target muscles
        if not target_muscles:
            goal_muscles = GOAL_MUSCLE_MAP.get(fitness_goal, GOAL_MUSCLE_MAP["general_fitness"])
            # Pick a subset for variety
            num_groups = min(3, len(goal_muscles))
            target_muscles = random.sample(goal_muscles, num_groups)

        # Find suitable exercises
        exercises = await self.exercise_repo.find_for_workout(
            equipment_list=equipment,
            difficulty=fitness_level,
            target_muscles=target_muscles,
            limit=exercise_count + 5,  # Get extras for variety
        )

        if len(exercises) < 3:
            # Fallback: get any exercises matching equipment
            exercises = await self.exercise_repo.find_for_workout(
                equipment_list=equipment,
                difficulty=fitness_level,
                limit=exercise_count + 5,
            )

        # Select and order exercises
        if len(exercises) > exercise_count:
            exercises = random.sample(exercises, exercise_count)

        # Build workout plan
        plan_exercises = []
        total_time = 0

        for idx, ex in enumerate(exercises):
            sets = config["sets"]
            reps = ex.get("default_reps")
            duration_sec = ex.get("default_duration_sec")

            if reps is None and duration_sec is None:
                reps = random.randint(*config["reps_range"])

            # Estimate time: (sets * (reps * 3sec + rest)) or (sets * (duration + rest))
            if reps:
                exercise_time = sets * (reps * 3 + ex.get("rest_time_sec", 60))
            else:
                exercise_time = sets * (duration_sec + ex.get("rest_time_sec", 60))

            total_time += exercise_time

            # Stop adding exercises if we exceed available time
            if total_time / 60 > available_time and len(plan_exercises) >= 3:
                break

            plan_exercises.append({
                "exercise_id": str(ex["_id"]),
                "exercise_name": ex["name"],
                "sets": sets,
                "reps": reps,
                "duration_sec": duration_sec,
                "rest_time_sec": ex.get("rest_time_sec", 60),
                "order": idx + 1,
            })

        # Determine title
        primary_muscle = target_muscles[0] if target_muscles else "full_body"
        title = WORKOUT_TITLES.get(primary_muscle, "Full Body Workout")

        # Determine description
        desc_parts = []
        muscle_set = set()
        for pe in plan_exercises:
            for ex in exercises:
                if str(ex["_id"]) == pe["exercise_id"]:
                    muscle_set.add(ex.get("target_muscle", ""))
        if muscle_set:
            desc_parts.append(f"Targets: {', '.join(muscle_set)}")
        desc_parts.append(f"{len(plan_exercises)} exercises")
        description = " • ".join(desc_parts)

        today = date.today().isoformat()
        plan_data = {
            "user_id": user_id,
            "date": today,
            "title": title,
            "description": description,
            "estimated_duration_min": max(10, int(total_time / 60)),
            "difficulty": fitness_level,
            "exercises": plan_exercises,
        }

        plan = await self.workout_repo.create(plan_data)
        return self._format_plan(plan)

    async def get_workout_history(
        self, user_id: str, limit: int = 30, skip: int = 0
    ) -> List[dict]:
        """Get user's workout plan history."""
        plans = await self.workout_repo.find_by_user(user_id, limit, skip)
        return [self._format_plan(p) for p in plans]

    async def get_workout_by_id(self, plan_id: str) -> Optional[dict]:
        """Get a single workout plan by ID."""
        plan = await self.workout_repo.find_by_id(plan_id)
        if plan:
            return self._format_plan(plan)
        return None

    async def _get_adaptation(self, user_id: str) -> Optional[dict]:
        """Check recent feedback and compute workout adaptations."""
        feedback = await self.feedback_repo.find_latest(user_id)
        if not feedback:
            return None

        adaptation = {}
        reason = feedback.get("reason")
        completion = feedback.get("completion_percentage", 100)

        # Adapt based on reason
        if reason == "too_difficult" and completion < 60:
            # Reduce difficulty
            level_map = {"advanced": "intermediate", "intermediate": "beginner"}
            current_level = feedback.get("difficulty_rating", 3)
            if current_level >= 4:
                adaptation["adjusted_level"] = "beginner"
            else:
                adaptation["adjusted_level"] = level_map.get("intermediate", "beginner")

        elif reason == "no_time":
            # Reduce duration
            adaptation["adjusted_time"] = 20

        elif reason == "no_equipment":
            # This is handled by equipment filtering already
            pass

        return adaptation if adaptation else None

    def _format_plan(self, plan: dict) -> dict:
        """Format workout plan for response."""
        return {
            "id": str(plan["_id"]),
            "user_id": plan["user_id"],
            "date": plan["date"],
            "title": plan["title"],
            "description": plan.get("description", ""),
            "estimated_duration_min": plan.get("estimated_duration_min", 30),
            "difficulty": plan.get("difficulty", "beginner"),
            "exercises": plan.get("exercises", []),
            "is_completed": plan.get("is_completed", False),
            "created_at": plan.get("created_at"),
        }
