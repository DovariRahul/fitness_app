from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db
from app.schemas.user import UserRegister, UserLogin
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(data: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register a new user account."""
    service = AuthService(db)
    return await service.register(data)


@router.post("/login")
async def login(data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login and receive a JWT token."""
    service = AuthService(db)
    return await service.login(data)
