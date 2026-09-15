import logging
from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.openai_provider import OpenAICompatibleProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.groq_provider import GroqProvider
from app.config import settings

logger = logging.getLogger(__name__)

_ai_provider_instance = None


def get_ai_provider() -> AIProvider:
    global _ai_provider_instance
    if _ai_provider_instance is None:
        provider_name = settings.AI_PROVIDER.lower()

        if provider_name == "openai" and settings.OPENAI_API_KEY:
            _ai_provider_instance = OpenAICompatibleProvider()
            logger.info(f"AI Provider initialized: OpenAI ({settings.OPENAI_MODEL})")

        elif provider_name == "gemini" and settings.GEMINI_API_KEY:
            _ai_provider_instance = GeminiProvider()
            logger.info(f"AI Provider initialized: Google Gemini ({settings.GEMINI_MODEL})")

        elif provider_name == "groq" and settings.GROQ_API_KEY:
            _ai_provider_instance = GroqProvider()
            logger.info(f"AI Provider initialized: Groq ({settings.GROQ_MODEL})")

        else:
            _ai_provider_instance = MockAIProvider()
            logger.info("AI Provider initialized: Mock AI (offline, zero-config)")

    return _ai_provider_instance

