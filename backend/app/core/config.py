from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "fitness_app"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = '["http://localhost:8081","http://localhost:19006"]'

    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        try:
            origins = json.loads(self.CORS_ORIGINS)
            # Ensure common Expo dev ports are always included
            common_origins = [
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:19006",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:8082",
            ]
            for o in common_origins:
                if o not in origins:
                    origins.append(o)
            return origins
        except Exception:
            return ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
