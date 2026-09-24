"""
Gemini AI Service — Generates personalized workout plans using the Gemini API.
"""

import json
import re
import asyncio
import functools
from typing import Optional
import google.generativeai as genai
from app.core.config import settings


def _get_model():
    """Initialize and return a Gemini generative model."""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-1.5-flash")


def _build_prompt(
    goal: str,
    fitness_level: str,
    duration_minutes: int,
    equipment: list[str],
    age: Optional[int] = None,
    weight_kg: Optional[float] = None,
    focus_areas: Optional[list[str]] = None,
    medical_notes: Optional[str] = None,
) -> str:
    """Build a structured prompt for Gemini workout plan generation."""

    goal_descriptions = {
        "muscle_gain": "build muscle mass and increase strength",
        "fat_loss": "burn fat, lose weight, and improve body composition",
        "strength": "increase raw strength and power",
        "endurance": "build cardiovascular endurance and stamina",
        "flexibility": "improve flexibility, mobility, and range of motion",
        "general_fitness": "improve overall fitness, health, and well-being",
        "athletic_performance": "enhance athletic performance and sport-specific fitness",
    }

    goal_desc = goal_descriptions.get(goal, "improve overall fitness")
    equipment_str = ", ".join(equipment) if equipment else "no equipment (bodyweight only)"
    focus_str = ", ".join(focus_areas) if focus_areas else "full body"
    age_str = f"Age: {age}" if age else ""
    weight_str = f"Weight: {weight_kg}kg" if weight_kg else ""
    medical_str = f"Medical notes: {medical_notes}" if medical_notes else ""

    return f"""You are an expert certified fitness trainer and nutritionist. Generate a detailed, personalized workout plan.

USER PROFILE:
- Goal: {goal_desc} ({goal})
- Fitness Level: {fitness_level}
- Available Time: {duration_minutes} minutes
- Equipment Available: {equipment_str}
- Focus Areas: {focus_str}
{age_str}
{weight_str}
{medical_str}

Generate a complete workout plan and return ONLY valid JSON (no markdown, no code blocks, no extra text) in this exact format:

{{
  "title": "Catchy workout plan title (e.g. 'Power Surge: Muscle Builder')",
  "description": "2-3 sentence motivating description of this workout plan and what the user will achieve",
  "estimated_duration_min": {duration_minutes},
  "difficulty": "{fitness_level}",
  "ai_tips": [
    "Specific tip 1 tailored to this goal and level",
    "Specific tip 2 about form or technique",
    "Specific tip 3 about progression or nutrition"
  ],
  "warmup": {{
    "duration_min": 5,
    "exercises": [
      {{"name": "Exercise name", "duration": "30-60 seconds", "instruction": "Brief how-to"}}
    ]
  }},
  "exercises": [
    {{
      "order": 1,
      "name": "Exercise name",
      "sets": 3,
      "reps": "10-12",
      "rest_sec": 60,
      "target_muscle": "primary muscle group",
      "instruction": "Clear 1-sentence technique instruction",
      "modification": "Easier alternative for beginners or if too hard"
    }}
  ],
  "cooldown": {{
    "duration_min": 5,
    "exercises": [
      {{"name": "Stretch name", "duration": "30-45 seconds", "instruction": "Brief instruction"}}
    ]
  }},
  "weekly_schedule_suggestion": "Brief suggestion on how many times per week to do this and what else to pair it with",
  "nutrition_tip": "One specific nutrition tip relevant to the goal"
}}

Requirements:
- Generate {min(4, duration_minutes // 8)}-{min(8, duration_minutes // 5)} main exercises appropriate for {fitness_level} level
- All exercises must be doable with: {equipment_str}
- Sets, reps, and rest times should match the {fitness_level} fitness level
- Include 2-3 warmup and 2-3 cooldown exercises
- Make instructions actionable and specific
- Return ONLY the JSON object, nothing else"""


def _build_smart_fallback_workout_plan(
    goal: str,
    fitness_level: str,
    duration_minutes: int,
    equipment: list[str],
    age: Optional[int] = None,
    weight_kg: Optional[float] = None,
    focus_areas: Optional[list[str]] = None,
    medical_notes: Optional[str] = None,
) -> dict:
    """Generate an adaptive, high-quality workout plan when Gemini is unavailable."""
    has_db = "dumbbells" in equipment or "barbell" in equipment
    has_bands = "resistance_bands" in equipment
    
    goal_titles = {
        "muscle_gain": "Hypertrophy Power Blast",
        "fat_loss": "High-Intensity Fat Incinerator",
        "strength": "Pure Strength & Core Builder",
        "endurance": "Cardio & Conditioning Surge",
        "flexibility": "Dynamic Mobility & Flow",
        "general_fitness": "Total Body Functional Fitness",
    }
    
    title = goal_titles.get(goal, "Adaptive Total Body Session")
    sets = 4 if fitness_level == "advanced" else 3
    reps = "8-10" if goal in ("muscle_gain", "strength") else "12-15"
    rest_sec = 45 if goal == "fat_loss" else 60

    exercise_pool = []
    if has_db:
        exercise_pool.extend([
            {"name": "Dumbbell Goblet Squat", "target_muscle": "quads & glutes", "instruction": "Hold dumbbell vertically at chest level, squat down keeping spine neutral.", "modification": "Bodyweight air squat"},
            {"name": "Dumbbell Floor Press", "target_muscle": "chest & triceps", "instruction": "Lie back, press dumbbells smoothly upward until arms are straight.", "modification": "Standard push-ups"},
            {"name": "Dumbbell Bent-Over Row", "target_muscle": "upper back & lats", "instruction": "Hinge at the hips with flat back, pull weights toward hip pockets.", "modification": "Inverted row or towel row"},
            {"name": "Dumbbell Overhead Shoulder Press", "target_muscle": "shoulders", "instruction": "Press dumbbells overhead without arching your lower back.", "modification": "Pike push-ups"},
            {"name": "Dumbbell Romanian Deadlift", "target_muscle": "hamstrings & glutes", "instruction": "Soft bend in knees, hinge hips back keeping dumbbells close to shins.", "modification": "Bodyweight single-leg hinge"},
            {"name": "Dumbbell Hammer Curls", "target_muscle": "biceps & forearms", "instruction": "Keep elbows pinned to ribs, curl dumbbells with palms facing each other.", "modification": "Resistance band curl"},
        ])
    else:
        exercise_pool.extend([
            {"name": "Push-up", "target_muscle": "chest & triceps", "instruction": "Keep core tight in high plank, lower chest to floor and push up with control.", "modification": "Incline or knee push-ups"},
            {"name": "Bodyweight Air Squats", "target_muscle": "quads & glutes", "instruction": "Feet shoulder-width apart, sink hips below parallel while keeping chest proud.", "modification": "Box squats onto a chair"},
            {"name": "Reverse Lunges", "target_muscle": "glutes & hamstrings", "instruction": "Step back and lower back knee toward ground, keeping front knee stacked over ankle.", "modification": "Stationary split squat"},
            {"name": "Pike Push-ups", "target_muscle": "shoulders", "instruction": "Hips elevated in inverted V, lower crown of head towards floor and press back up.", "modification": "Elevated pike or high plank hold"},
            {"name": "Mountain Climbers", "target_muscle": "core & cardio", "instruction": "Drive knees alternately towards chest with brisk controlled tempo.", "modification": "Slow paced mountain climbers"},
            {"name": "Plank with Shoulder Taps", "target_muscle": "core & stability", "instruction": "Hold plank, tap opposite shoulder minimizing hip sway.", "modification": "Kneeling plank taps"},
            {"name": "Glute Bridges", "target_muscle": "glutes & lower back", "instruction": "Lie on back, drive heels into floor to bridge hips up and squeeze glutes.", "modification": "Standard bridge hold"},
        ])

    num_exercises = max(4, min(len(exercise_pool), duration_minutes // 6))
    chosen_exercises = exercise_pool[:num_exercises]

    exercises_output = []
    for idx, ex in enumerate(chosen_exercises, 1):
        exercises_output.append({
            "order": idx,
            "name": ex["name"],
            "sets": sets,
            "reps": reps,
            "rest_sec": rest_sec,
            "target_muscle": ex["target_muscle"],
            "instruction": ex["instruction"],
            "modification": ex["modification"],
        })

    return {
        "title": title,
        "description": f"Targeted {duration_minutes}-minute session designed for {fitness_level} level focused on {goal.replace('_', ' ')}.",
        "estimated_duration_min": duration_minutes,
        "difficulty": fitness_level,
        "ai_tips": [
            f"Focus on mind-muscle connection during each repetition.",
            f"Rest {rest_sec} seconds between sets to optimize energy and recovery.",
            "Stay hydrated: drink at least 500ml water throughout the session."
        ],
        "warmup": {
            "duration_min": 5,
            "exercises": [
                {"name": "Arm Circles & Shoulder Rolls", "duration": "60 seconds", "instruction": "Forward and backward dynamic mobility."},
                {"name": "Bodyweight Good Mornings", "duration": "60 seconds", "instruction": "Warm up hamstrings and posterior chain."},
                {"name": "Jumping Jacks or Light Jog", "duration": "2 minutes", "instruction": "Elevate heart rate and core temperature."}
            ]
        },
        "exercises": exercises_output,
        "cooldown": {
            "duration_min": 5,
            "exercises": [
                {"name": "Child's Pose", "duration": "60 seconds", "instruction": "Lengthen the spine and relax shoulders."},
                {"name": "Kneeling Hip Flexor Stretch", "duration": "45 seconds per side", "instruction": "Tuck pelvis and shift weight forward gently."},
                {"name": "Deep Breathing", "duration": "60 seconds", "instruction": "Slow diaphragmatic breathing to lower heart rate."}
            ]
        },
        "weekly_schedule_suggestion": "Perform this workout 3-4 times per week with rest or active recovery days between sessions.",
        "nutrition_tip": "Consume 20-30g of high quality protein within 60 minutes post-workout for optimal recovery."
    }


async def generate_ai_workout_plan(
    goal: str,
    fitness_level: str,
    duration_minutes: int,
    equipment: list[str],
    age: Optional[int] = None,
    weight_kg: Optional[float] = None,
    focus_areas: Optional[list[str]] = None,
    medical_notes: Optional[str] = None,
) -> dict:
    """
    Call Gemini API to generate a personalized workout plan.
    Falls back gracefully to intelligent algorithmic generator if Gemini is unavailable.
    """
    can_use_gemini = (
        bool(settings.GEMINI_API_KEY)
        and settings.GEMINI_API_KEY.startswith("AIza")
    )

    if not can_use_gemini:
        return _build_smart_fallback_workout_plan(
            goal=goal,
            fitness_level=fitness_level,
            duration_minutes=duration_minutes,
            equipment=equipment,
            age=age,
            weight_kg=weight_kg,
            focus_areas=focus_areas,
            medical_notes=medical_notes,
        )

    try:
        model = _get_model()
        prompt = _build_prompt(
            goal=goal,
            fitness_level=fitness_level,
            duration_minutes=duration_minutes,
            equipment=equipment,
            age=age,
            weight_kg=weight_kg,
            focus_areas=focus_areas,
            medical_notes=medical_notes,
        )

        def _call_gemini():
            return model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                ),
            )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, functools.partial(_call_gemini))
        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        raw_text = raw_text.strip()
        return json.loads(raw_text)
    except Exception as e:
        print(f"[Gemini] Warning: Gemini API call failed ({e}). Using smart adaptive plan.")
        return _build_smart_fallback_workout_plan(
            goal=goal,
            fitness_level=fitness_level,
            duration_minutes=duration_minutes,
            equipment=equipment,
            age=age,
            weight_kg=weight_kg,
            focus_areas=focus_areas,
            medical_notes=medical_notes,
        )
