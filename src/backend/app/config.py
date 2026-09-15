from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "CyberSentinel — AI-Powered SOC Analyst"
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    DATABASE_URL: str = "sqlite:///./cybersentinel.db"
    
    # AI Provider: 'mock' (default offline), 'openai', 'gemini', or 'groq'
    AI_PROVIDER: str = "mock"

    # OpenAI settings (used when AI_PROVIDER=openai)
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Google Gemini settings (used when AI_PROVIDER=gemini)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Groq settings (used when AI_PROVIDER=groq)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Threat Detection Thresholds
    BRUTE_FORCE_THRESHOLD: int = 5
    BRUTE_FORCE_WINDOW_MINUTES: int = 10
    LARGE_TRANSFER_THRESHOLD_BYTES: int = 1024 * 1024 * 1024  # 1 GB
    CORRELATION_WINDOW_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
