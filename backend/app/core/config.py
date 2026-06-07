from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyLex API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: str

    REDIS_URL: Optional[str] = None
    GOOGLE_IMAGE_API_KEY: Optional[str] = None
    SEARCH_ENGINE_ID: Optional[str] = None
    BACKEND_BASE_URL: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    FRONTEND_BASE_URL: Optional[str] = None
    EMAIL_SENDER: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()