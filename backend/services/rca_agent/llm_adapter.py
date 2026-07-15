from typing import Any
import structlog
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from app.config import settings

logger = structlog.get_logger()

class LLMAdapter:
    """
    Provider-agnostic interface.
    Defaults to Groq as requested, but can easily swap to ChatOpenAI or ChatOllama.
    """
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.model_name = settings.LLM_MODEL
        logger.info("initializing_llm_adapter", provider=self.provider, model=self.model_name)
        self.llm = self._initialize_llm()

    def _initialize_llm(self) -> BaseChatModel:
        if self.provider == "groq":
            if not settings.GROQ_API_KEY:
                logger.warning("GROQ_API_KEY not set. LLM calls will fail.")
            return ChatGroq(
                temperature=0.1,
                groq_api_key=settings.GROQ_API_KEY,
                model_name=self.model_name
            )
        # Add support for ollama, openai, anthropic here
        elif self.provider == "ollama":
            from langchain_community.chat_models import ChatOllama
            return ChatOllama(model=self.model_name, temperature=0.1)
        else:
            raise ValueError(f"Unsupported LLM Provider: {self.provider}")

    def get_llm(self) -> BaseChatModel:
        return self.llm

llm_adapter = LLMAdapter()
