from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.db.repositories.session_repo import SessionRepository
from app.db.repositories.workout_repo import WorkoutRepository


class SessionService:
    """Workout session tracking business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.session_repo = SessionRepository(db)
        self.workout_repo = WorkoutRepository(db)

    async def start_session(self, user_id: str, plan_id: str) -> dict:
        """Start a new workout session from a plan."""
        plan = await self.workout_repo.find_by_id(plan_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found",
            )

        # Build session exercises from plan
        session_exercises = []
        for ex in plan.get("exercises", []):
            session_exercises.append({
                "exercise_id": ex["exercise_id"],
                "exercise_name": ex["exercise_name"],
                "sets_completed": 0,
                "sets_total": ex["sets"],
                "reps_completed": [],
                "completed": False,
            })

        session_data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "date": datetime.now(timezone.utc),
            "exercises": session_exercises,
        }

        session = await self.session_repo.create(session_data)
        return self._format_session(session)

    async def update_exercise(
        self, session_id: str, exercise_id: str,
        sets_completed: int, reps_completed: list, completed: bool
    ) -> dict:
        """Update a specific exercise's progress in a session."""
        session = await self.session_repo.find_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        exercises = session.get("exercises", [])
        for ex in exercises:
            if ex["exercise_id"] == exercise_id:
                ex["sets_completed"] = sets_completed
                ex["reps_completed"] = reps_completed
                ex["completed"] = completed
                break

        # Recalculate completion percentage
        total = len(exercises)
        completed_count = sum(1 for e in exercises if e["completed"])
        completion_pct = (completed_count / total * 100) if total > 0 else 0

        update_data = {
            "exercises": exercises,
            "completion_percentage": round(completion_pct, 1),
        }

        session = await self.session_repo.update(session_id, update_data)
        return self._format_session(session)

    async def complete_session(self, session_id: str) -> dict:
        """Mark a session as complete."""
        session = await self.session_repo.find_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        # Calculate final stats
        exercises = session.get("exercises", [])
        total = len(exercises)
        completed_count = sum(1 for e in exercises if e["completed"])
        completion_pct = (completed_count / total * 100) if total > 0 else 0

        started_at = session.get("started_at", datetime.now(timezone.utc))
        now = datetime.now(timezone.utc)
        duration_sec = int((now - started_at).total_seconds())

        # Rough calorie estimate: 5 cal/min for moderate exercise
        calories = round(duration_sec / 60 * 5, 1)

        completion_data = {
            "completion_percentage": round(completion_pct, 1),
            "total_duration_sec": duration_sec,
            "calories_burned": calories,
        }

        session = await self.session_repo.complete(session_id, completion_data)

        # Mark the plan as completed if 100%
        if completion_pct >= 100:
            plan_id = session.get("plan_id")
            if plan_id:
                await self.workout_repo.mark_completed(plan_id)

        return self._format_session(session)

    def _format_session(self, session: dict) -> dict:
        """Format session for response."""
        return {
            "id": str(session["_id"]),
            "user_id": session["user_id"],
            "plan_id": session["plan_id"],
            "date": session.get("date"),
            "exercises": session.get("exercises", []),
            "total_duration_sec": session.get("total_duration_sec", 0),
            "completion_percentage": session.get("completion_percentage", 0.0),
            "calories_burned": session.get("calories_burned", 0.0),
            "started_at": session.get("started_at"),
            "finished_at": session.get("finished_at"),
        }
