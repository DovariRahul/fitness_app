from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from bson import ObjectId

from app.db.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserRegister, UserLogin, AssessmentRequest


class AuthService:
    """Authentication business logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.user_repo = UserRepository(db)

    async def register(self, data: UserRegister) -> dict:
        """Register a new user."""
        # Check if email already exists
        existing = await self.user_repo.find_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create user
        user_data = {
            "name": data.name,
            "email": data.email,
            "password_hash": hash_password(data.password),
        }
        user = await self.user_repo.create(user_data)

        # Generate token
        token = create_access_token({"sub": str(user["_id"])})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": self._format_user(user),
        }

    async def login(self, data: UserLogin) -> dict:
        """Authenticate a user and return a JWT token."""
        user = await self.user_repo.find_by_email(data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token({"sub": str(user["_id"])})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": self._format_user(user),
        }

    def _format_user(self, user: dict) -> dict:
        """Format user document for API response."""
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "avatar_url": user.get("avatar_url"),
            "profile": user.get("profile"),
            "assessment_completed": user.get("assessment_completed", False),
        }
