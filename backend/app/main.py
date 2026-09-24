from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.connection import connect_to_mongo, close_mongo_connection
from app.db.seed import seed_exercises

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.exercises import router as exercises_router
from app.api.v1.workouts import router as workouts_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.progress import router as progress_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: connect to DB on startup, disconnect on shutdown."""
    await connect_to_mongo()
    await seed_exercises()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="AI Fitness App API",
    description="AI-Powered Adaptive Fitness and Personalized Workout System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (for workout videos and media)
import os
from fastapi.staticfiles import StaticFiles

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Register API routers
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(exercises_router, prefix=API_PREFIX)
app.include_router(workouts_router, prefix=API_PREFIX)
app.include_router(sessions_router, prefix=API_PREFIX)
app.include_router(feedback_router, prefix=API_PREFIX)
app.include_router(progress_router, prefix=API_PREFIX)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "AI Fitness App API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }
