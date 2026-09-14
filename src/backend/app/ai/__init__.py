from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.openai_provider import OpenAICompatibleProvider
from app.config import settings

_ai_provider_instance = None


def get_ai_provider() -> AIProvider:
    global _ai_provider_instance
    if _ai_provider_instance is None:
        if settings.AI_PROVIDER.lower() == "openai" and settings.OPENAI_API_KEY:
            _ai_provider_instance = OpenAICompatibleProvider()
        else:
            _ai_provider_instance = MockAIProvider()
    return _ai_provider_instance
