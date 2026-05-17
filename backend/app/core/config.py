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

    # Credenciales Externas (agregadas para evitar el error 'extra_forbidden')
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GEMINI_API_KEY: str
    GROQ_API_KEY: str

    # Configuración de Pydantic v2
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Le dice a Pydantic que ignore cualquier otra variable que no esté definida arriba
    )

settings = Settings()