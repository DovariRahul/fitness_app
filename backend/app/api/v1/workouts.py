from fastapi import APIRouter, Depends, Query, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from pydantic import BaseModel
from datetime import date

from app.deps import get_db, get_current_user
from app.schemas.workout import GenerateWorkoutRequest
from app.services.workout_service import WorkoutService
from app.services.gemini_service import generate_ai_workout_plan

router = APIRouter(prefix="/workouts", tags=["Workouts"])


class AIGenerateRequest(BaseModel):
    """Request body for Gemini AI workout plan generation."""
    goal: str = "general_fitness"           # muscle_gain | fat_loss | strength | endurance | flexibility | general_fitness
    fitness_level: str = "beginner"         # beginner | intermediate | advanced
    duration_minutes: int = 30              # 10 – 90
    equipment: List[str] = ["none"]         # none, dumbbells, barbell, resistance_bands, machine, etc.
    focus_areas: Optional[List[str]] = None # chest, back, legs, core, arms, …
    medical_notes: Optional[str] = None


class CreateManualWorkoutRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    difficulty: str = "intermediate"
    estimated_duration_min: int = 30
    exercises: Optional[List[dict]] = []
    goal: Optional[str] = "custom"
    day: Optional[str] = None
    time: Optional[str] = None


class BatchManualWorkoutRequest(BaseModel):
    plans: List[CreateManualWorkoutRequest]


@router.get("/today")
async def get_today_workout(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get today's workout plan (auto-generates if none exists)."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    profile = current_user.get("profile")
    plan = await service.get_today_workout(user_id, profile)

    if not plan:
        return {"message": "Please complete your fitness assessment first."}

    return plan


@router.post("/generate-ai")
async def generate_ai_workout(
    data: AIGenerateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Generate a personalized workout plan using Gemini AI.
    Takes user preferences (goal, level, duration, equipment) and returns
    a fully structured plan with exercises, warmup, cooldown, and tips.
    """
    profile = current_user.get("profile", {}) or {}
    age = profile.get("age")
    weight_kg = profile.get("weight_kg")

    try:
        ai_plan = await generate_ai_workout_plan(
            goal=data.goal,
            fitness_level=data.fitness_level,
            duration_minutes=data.duration_minutes,
            equipment=data.equipment,
            age=age,
            weight_kg=weight_kg,
            focus_areas=data.focus_areas,
            medical_notes=data.medical_notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Persist the plan to the database
    service = WorkoutService(db)
    user_id = str(current_user["_id"])

    # Map AI plan exercises to DB format
    db_exercises = []
    for idx, ex in enumerate(ai_plan.get("exercises", [])):
        db_exercises.append({
            "exercise_id": f"ai-{idx}",
            "exercise_name": ex.get("name", ""),
            "sets": ex.get("sets", 3),
            "reps": ex.get("reps"),
            "duration_sec": None,
            "rest_time_sec": ex.get("rest_sec", 60),
            "order": ex.get("order", idx + 1),
            "instruction": ex.get("instruction", ""),
            "modification": ex.get("modification", ""),
            "target_muscle": ex.get("target_muscle", ""),
        })

    plan_data = {
        "user_id": user_id,
        "date": date.today().isoformat(),
        "title": ai_plan.get("title", "AI Workout Plan"),
        "description": ai_plan.get("description", ""),
        "estimated_duration_min": ai_plan.get("estimated_duration_min", data.duration_minutes),
        "difficulty": ai_plan.get("difficulty", data.fitness_level),
        "exercises": db_exercises,
        "ai_generated": True,
        "ai_tips": ai_plan.get("ai_tips", []),
        "warmup": ai_plan.get("warmup", {}),
        "cooldown": ai_plan.get("cooldown", {}),
        "weekly_schedule_suggestion": ai_plan.get("weekly_schedule_suggestion", ""),
        "nutrition_tip": ai_plan.get("nutrition_tip", ""),
        "goal": data.goal,
    }

    saved_plan = await service.workout_repo.create(plan_data)

    return {
        **service._format_plan(saved_plan),
        "ai_tips": plan_data["ai_tips"],
        "warmup": plan_data["warmup"],
        "cooldown": plan_data["cooldown"],
        "weekly_schedule_suggestion": plan_data["weekly_schedule_suggestion"],
        "nutrition_tip": plan_data["nutrition_tip"],
        "goal": data.goal,
        "ai_generated": True,
    }


@router.post("/generate")
async def generate_workout(
    data: GenerateWorkoutRequest = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Generate a new personalized workout plan (rule-based)."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    profile = current_user.get("profile")

    if not profile:
        return {"message": "Please complete your fitness assessment first."}

    return await service.generate_workout(
        user_id=user_id,
        user_profile=profile,
        target_muscles=data.target_muscles if data else None,
        duration_override=data.duration_override if data else None,
        difficulty_override=data.difficulty_override if data else None,
    )


@router.post("/manual")
async def create_manual_workout(
    data: CreateManualWorkoutRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a custom manual workout plan."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])

    formatted_exercises = []
    for idx, ex in enumerate(data.exercises or []):
        formatted_exercises.append({
            "exercise_id": ex.get("exercise_id") or f"manual-{idx}",
            "exercise_name": ex.get("exercise_name") or ex.get("name", f"Exercise {idx + 1}"),
            "sets": int(ex.get("sets", 3)),
            "reps": int(ex.get("reps", 10)) if ex.get("reps") is not None else 10,
            "duration_sec": int(ex.get("duration_sec", 45)) if ex.get("duration_sec") else None,
            "rest_time_sec": int(ex.get("rest_time_sec", 60)),
            "order": idx + 1,
            "instruction": ex.get("instruction", ""),
            "target_muscle": ex.get("target_muscle", ""),
        })

    plan_data = {
        "user_id": user_id,
        "date": date.today().isoformat(),
        "title": data.title.strip() if data.title else "Custom Workout",
        "description": data.description.strip() if data.description else "Custom manual workout routine",
        "estimated_duration_min": data.estimated_duration_min,
        "difficulty": data.difficulty,
        "exercises": formatted_exercises,
        "ai_generated": False,
        "goal": data.goal or "custom",
        "day": data.day,
        "time": data.time,
    }

    saved_plan = await service.workout_repo.create(plan_data)
    return service._format_plan(saved_plan)


@router.post("/manual/batch")
async def create_manual_workout_batch(
    data: BatchManualWorkoutRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create multiple custom manual workout plans (e.g. for several days of the week)."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    created_plans = []

    for plan_req in data.plans:
        formatted_exercises = []
        for idx, ex in enumerate(plan_req.exercises or []):
            formatted_exercises.append({
                "exercise_id": ex.get("exercise_id") or f"manual-{idx}",
                "exercise_name": ex.get("exercise_name") or ex.get("name", f"Exercise {idx + 1}"),
                "sets": int(ex.get("sets", 3)),
                "reps": int(ex.get("reps", 10)) if ex.get("reps") is not None else 10,
                "duration_sec": int(ex.get("duration_sec", 45)) if ex.get("duration_sec") else None,
                "rest_time_sec": int(ex.get("rest_time_sec", 60)),
                "order": idx + 1,
                "instruction": ex.get("instruction", ""),
                "target_muscle": ex.get("target_muscle", ""),
            })

        plan_data = {
            "user_id": user_id,
            "date": date.today().isoformat(),
            "title": plan_req.title.strip() if plan_req.title else "Custom Workout",
            "description": plan_req.description.strip() if plan_req.description else "Custom manual workout routine",
            "estimated_duration_min": plan_req.estimated_duration_min,
            "difficulty": plan_req.difficulty,
            "exercises": formatted_exercises,
            "ai_generated": False,
            "goal": plan_req.goal or "custom",
            "day": plan_req.day,
            "time": plan_req.time,
        }

        saved = await service.workout_repo.create(plan_data)
        created_plans.append(service._format_plan(saved))

    return created_plans


@router.get("/history")
async def get_workout_history(
    limit: int = Query(30, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get workout history."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    return await service.get_workout_history(user_id, limit, skip)


@router.get("/{plan_id}")
async def get_workout(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a specific workout plan by ID."""
    service = WorkoutService(db)
    plan = await service.get_workout_by_id(plan_id)
    if not plan:
        return {"error": "Workout not found"}
    return plan


@router.delete("/{plan_id}")
async def delete_workout(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a workout plan."""
    service = WorkoutService(db)
    user_id = str(current_user["_id"])
    success = await service.delete_workout(plan_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workout plan not found or already deleted")
    return {"message": "Workout plan deleted successfully", "id": plan_id}
