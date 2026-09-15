from typing import List, Optional
from pydantic import BaseModel
from app.schemas.incident import RiskFactorItem, ResponseActionBase


class InvestigationResult(BaseModel):
    incident_id: str
    incident_summary: str
    attack_hypothesis: str
    why_suspicious: str
    confidence: int
    affected_assets: List[str]
    risk_score: int
    severity: str
    risk_factors: List[RiskFactorItem]
    recommended_actions: List[ResponseActionBase]
    analyst_notes: str


class IncidentReportResponse(BaseModel):
    incident_id: str
    title: str
    severity: str
    risk_score: int
    confidence: int
    status: str
    affected_user: str
    affected_asset: str
    first_seen: str
    last_seen: str
    summary: str
    attack_hypothesis: str
    why_dangerous: str
    risk_factors: List[RiskFactorItem]
    timeline: List[dict]
    recommended_actions: List[dict]
    analyst_notes: str
    markdown: str
