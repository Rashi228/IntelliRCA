from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    KAFKA_BROKER_URL: str
    KAFKA_RAW_ALERTS_TOPIC: str
    KAFKA_NORMALIZED_ALERTS_TOPIC: str
    KAFKA_ACTIVE_INCIDENTS_TOPIC: str
    KAFKA_RESOLVED_INCIDENTS_TOPIC: str
    QDRANT_URL: str
    QDRANT_ALERTS_COLLECTION: str
    NEO4J_URI: str
    NEO4J_USER: str
    NEO4J_PASSWORD: str
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    LLM_MODEL: str = "llama3-70b-8192"
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
