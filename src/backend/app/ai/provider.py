from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.models.incident import Incident
from app.models.event import SecurityEvent


class AIProvider(ABC):
    @abstractmethod
    def investigate_incident(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        risk_score: int,
        risk_factors: List[Dict[str, Any]],
        asset_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates incident summary, attack hypothesis, why it is suspicious,
        confidence, and analyst notes.
        """
        pass

    @abstractmethod
    def explain_risk(
        self,
        incident: Incident,
        risk_factors: List[Dict[str, Any]]
    ) -> str:
        """
        Generates concise, plain-English explanation of why this incident is dangerous.
        """
        pass

    @abstractmethod
    def generate_response_plan(
        self,
        incident: Incident,
        events: List[SecurityEvent]
    ) -> List[Dict[str, Any]]:
        """
        Generates recommended non-destructive response actions with priority and justification.
        """
        pass

    @abstractmethod
    def generate_report(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        investigation: Dict[str, Any]
    ) -> str:
        """
        Generates comprehensive markdown SOC incident report.
        """
        pass

    @abstractmethod
    def answer_question(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        question: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Answers natural language questions strictly grounded in the incident evidence.
        """
        pass
