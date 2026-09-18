import asyncio
import httpx
from app.main import app
from app.db.connection import connect_to_mongo, close_mongo_connection
from app.db.seed import seed_exercises

async def test_all():
    print("--- Starting Backend API Verification ---")
    await connect_to_mongo()
    await seed_exercises()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/")
        print(f"1. Health Check: {res.status_code} - {res.json().get('message')}")
        assert res.status_code == 200

        # 2. Exercises list
        res = await client.get("/api/v1/exercises")
        print(f"2. Exercises: {res.status_code} - Retrieved {len(res.json())} exercises")
        assert res.status_code == 200
        assert len(res.json()) > 0

        # 3. Register or Login Demo User
        demo_email = "demo.athlete@example.com"
        demo_pass = "DemoPass123!"
        reg_res = await client.post("/api/v1/auth/register", json={
            "name": "Talan Levin",
            "email": demo_email,
            "password": demo_pass
        })
        if reg_res.status_code == 200:
            token = reg_res.json()["access_token"]
            print(f"3. Register Demo User: 200 OK")
        else:
            login_res = await client.post("/api/v1/auth/login", json={
                "email": demo_email,
                "password": demo_pass
            })
            print(f"3. Login Existing Demo User: {login_res.status_code}")
            assert login_res.status_code == 200
            token = login_res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 4. User Profile & Assessment
        assessment_res = await client.post("/api/v1/users/assessment", headers=headers, json={
            "age": 25,
            "height_cm": 175.0,
            "weight_kg": 72.0,
            "fitness_goal": "muscle_gain",
            "fitness_level": "intermediate",
            "available_time_minutes": 30,
            "workout_experience_months": 6,
            "available_equipment": ["dumbbells", "none"],
            "preferred_workout_days": ["mon", "wed", "fri"],
            "has_medical_concerns": False,
        })
        print(f"4. User Assessment: {assessment_res.status_code} - {assessment_res.text}")
        assert assessment_res.status_code == 200

        me_res = await client.get("/api/v1/users/me", headers=headers)
        print(f"5. Current User Profile: {me_res.status_code} - User: {me_res.json().get('name')}")
        assert me_res.status_code == 200

        # 6. Workouts
        workout_res = await client.get("/api/v1/workouts/today", headers=headers)
        print(f"6. Today Workout: {workout_res.status_code}")
        assert workout_res.status_code == 200
        workout_data = workout_res.json()
        workout_id = workout_data.get("id")

        if workout_id:
            get_w_res = await client.get(f"/api/v1/workouts/{workout_id}", headers=headers)
            print(f"7. Get Workout By ID: {get_w_res.status_code} - Title: {get_w_res.json().get('title')}")
            assert get_w_res.status_code == 200

        # 8. Progress Stats
        stats_res = await client.get("/api/v1/progress/stats", headers=headers)
        print(f"8. Progress Stats: {stats_res.status_code}")
        assert stats_res.status_code == 200

        # 9. Weekly Progress
        weekly_res = await client.get("/api/v1/progress/weekly", headers=headers)
        print(f"9. Weekly Progress: {weekly_res.status_code}")
        assert weekly_res.status_code == 200

    await close_mongo_connection()
    print("--- ALL BACKEND APIS VERIFIED SUCCESSFULLY ---")

if __name__ == "__main__":
    asyncio.run(test_all())
