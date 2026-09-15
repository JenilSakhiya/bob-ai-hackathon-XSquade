import logging
from typing import List, Dict, Any, Optional
import httpx
from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.models.incident import Incident
from app.models.event import SecurityEvent
from app.config import settings

logger = logging.getLogger(__name__)


class OpenAICompatibleProvider(AIProvider):
    """
    Standard OpenAI-compatible AI provider (supports OpenAI, Ollama, Groq, vLLM).
    Automatically falls back to MockAIProvider if credentials are not configured or request fails.
    """

    def __init__(self):
        self.mock_fallback = MockAIProvider()
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip("/")
        self.model = settings.OPENAI_MODEL

    def _has_valid_credentials(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _call_llm(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self._has_valid_credentials():
            return None
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"LLM API returned status {res.status_code}, falling back to Mock AI.")
                    return None
        except Exception as e:
            logger.warning(f"Error calling LLM endpoint: {e}, falling back to Mock AI.")
            return None

    def investigate_incident(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        risk_score: int,
        risk_factors: List[Dict[str, Any]],
        asset_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        # If no credentials or error, return deterministic mock investigation
        if not self._has_valid_credentials():
            return self.mock_fallback.investigate_incident(incident, events, risk_score, risk_factors, asset_info)

        system_prompt = (
            "You are CyberSentinel, an AI-powered Security Operations Center (SOC) analyst. "
            "Analyze the security incident telemetry objectively. Use probabilistic phrasing such as 'likely', "
            "'suspected', or 'possible'. Return concise insights grounded strictly in the provided data."
        )
        user_prompt = (
            f"Incident: {incident.title} (ID: {incident.id}, Severity: {incident.severity}, Risk: {risk_score})\n"
            f"User: {incident.affected_user}, Asset: {incident.affected_asset}\n"
            f"Risk Factors: {risk_factors}\n"
            f"Events Count: {len(events)}\n"
            "Provide an incident summary, attack hypothesis, and explanation of dangerousness."
        )
        llm_reply = self._call_llm(system_prompt, user_prompt)
        if not llm_reply:
            return self.mock_fallback.investigate_incident(incident, events, risk_score, risk_factors, asset_info)

        base_res = self.mock_fallback.investigate_incident(incident, events, risk_score, risk_factors, asset_info)
        base_res["analyst_notes"] = f"[LLM Assisted] {llm_reply[:300]}"
        return base_res

    def explain_risk(
        self,
        incident: Incident,
        risk_factors: List[Dict[str, Any]]
    ) -> str:
        if not self._has_valid_credentials():
            return self.mock_fallback.explain_risk(incident, risk_factors)
        
        reply = self._call_llm(
            "You are a cybersecurity expert explaining threat risk to SOC analysts.",
            f"Explain why this incident ({incident.title}, Risk: {incident.risk_score}/100) is dangerous given these factors: {risk_factors}."
        )
        return reply or self.mock_fallback.explain_risk(incident, risk_factors)

    def generate_response_plan(
        self,
        incident: Incident,
        events: List[SecurityEvent]
    ) -> List[Dict[str, Any]]:
        return self.mock_fallback.generate_response_plan(incident, events)

    def generate_report(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        investigation: Dict[str, Any]
    ) -> str:
        return self.mock_fallback.generate_report(incident, events, investigation)

    def answer_question(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        question: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        if not self._has_valid_credentials():
            return self.mock_fallback.answer_question(incident, events, question, chat_history)

        events_summary = "\n".join([f"- {e.timestamp.strftime('%H:%M:%S')}: {e.event_type} ({e.description})" for e in events[:15]])
        system_prompt = (
            "You are CyberSentinel, an AI SOC assistant answering analyst inquiries. "
            "You must answer using ONLY the selected incident's available data. Do not invent evidence. "
            "If information is unavailable in the provided telemetry, state: 'Insufficient evidence in the current incident data.'"
        )
        user_prompt = (
            f"Incident: {incident.title} (ID: {incident.id}, Severity: {incident.severity}, Score: {incident.risk_score}/100)\n"
            f"User: {incident.affected_user}, Asset: {incident.affected_asset}\n"
            f"Risk factors: {incident.risk_factors}\n"
            f"Events:\n{events_summary}\n\n"
            f"Analyst Question: {question}"
        )
        reply = self._call_llm(system_prompt, user_prompt)
        return reply or self.mock_fallback.answer_question(incident, events, question, chat_history)
