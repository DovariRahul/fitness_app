from datetime import datetime, timedelta, timezone, date
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.repositories.session_repo import SessionRepository
from app.db.repositories.workout_repo import WorkoutRepository
from app.db.repositories.feedback_repo import FeedbackRepository


class ProgressService:
    """Progress analysis and stats business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.session_repo = SessionRepository(db)
        self.workout_repo = WorkoutRepository(db)
        self.feedback_repo = FeedbackRepository(db)

    async def get_stats(self, user_id: str) -> dict:
        """Get overall fitness stats."""
        total_workouts = await self.workout_repo.count_user_workouts(user_id)
        completed_workouts = await self.workout_repo.count_completed(user_id)
        completed_sessions = await self.session_repo.count_completed(user_id)

        # Get recent sessions for calorie and duration calculation
        recent_sessions = await self.session_repo.find_by_user(user_id, limit=100)

        total_calories = sum(s.get("calories_burned", 0) for s in recent_sessions)
        total_duration = sum(s.get("total_duration_sec", 0) for s in recent_sessions)

        # Calculate completion rate
        completion_rate = (
            round(completed_workouts / total_workouts * 100, 1)
            if total_workouts > 0
            else 0
        )

        # Calculate streak
        streak = await self._calculate_streak(user_id)

        return {
            "total_workouts": total_workouts,
            "completed_workouts": completed_workouts,
            "completion_rate": completion_rate,
            "streak": streak,
            "total_calories": round(total_calories, 1),
            "total_duration_minutes": round(total_duration / 60, 1),
        }

    async def get_weekly_progress(self, user_id: str) -> dict:
        """Get this week's daily progress data."""
        today = date.today()
        # Get the start of the week (Monday)
        start_of_week = today - timedelta(days=today.weekday())

        daily_data = []
        total_completion = 0
        days_with_workouts = 0

        for i in range(7):
            day = start_of_week + timedelta(days=i)
            day_str = day.isoformat()
            day_name = day.strftime("%a")[0]  # M, T, W, T, F, S, S

            # Check if there's a plan for this day
            plan = await self.workout_repo.find_today(user_id, day_str)

            completion = 0
            if plan and plan.get("is_completed"):
                completion = 100
                days_with_workouts += 1
                total_completion += 100
            elif plan:
                # Get the session for this plan
                sessions = await self.session_repo.find_by_user(user_id, limit=1)
                for session in sessions:
                    if session.get("plan_id") == str(plan["_id"]):
                        completion = session.get("completion_percentage", 0)
                        if completion > 0:
                            days_with_workouts += 1
                            total_completion += completion
                        break

            daily_data.append({
                "day": day_name,
                "date": day_str,
                "completion": round(completion, 1),
                "is_today": day == today,
            })

        avg_completion = (
            round(total_completion / days_with_workouts, 1)
            if days_with_workouts > 0
            else 0
        )

        return {
            "days": daily_data,
            "average_completion": avg_completion,
            "workouts_this_week": days_with_workouts,
        }

    async def _calculate_streak(self, user_id: str) -> int:
        """Calculate current consecutive workout streak."""
        plans = await self.workout_repo.find_by_user(user_id, limit=60)
        if not plans:
            return 0

        streak = 0
        today = date.today()
        check_date = today

        # Sort plans by date descending (already done by repo)
        completed_dates = set()
        for plan in plans:
            if plan.get("is_completed"):
                completed_dates.add(plan["date"])

        # Count consecutive days from today backwards
        for i in range(60):
            check = (today - timedelta(days=i)).isoformat()
            if check in completed_dates:
                streak += 1
            elif i == 0:
                # Today not yet completed, check yesterday
                continue
            else:
                break

        return streak
