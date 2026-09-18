from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings


class Database:
    """Async MongoDB connection manager using Motor."""

    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


database = Database()


async def connect_to_mongo():
    """Initialize the Motor client and select the database."""
    database.client = AsyncIOMotorClient(settings.MONGODB_URI)
    database.db = database.client[settings.DATABASE_NAME]

    # Create indexes
    await database.db.users.create_index("email", unique=True)
    await database.db.exercises.create_index("name")
    await database.db.exercises.create_index("target_muscle")
    await database.db.exercises.create_index("difficulty")
    await database.db.exercises.create_index("equipment")
    await database.db.workout_plans.create_index([("user_id", 1), ("date", -1)])
    await database.db.workout_sessions.create_index([("user_id", 1), ("date", -1)])
    await database.db.user_feedback.create_index([("user_id", 1), ("created_at", -1)])

    print("[DB] Connected to MongoDB successfully")


async def close_mongo_connection():
    """Close the Motor client connection."""
    if database.client:
        database.client.close()
        print("[DB] Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    """Get the current database instance."""
    return database.db
