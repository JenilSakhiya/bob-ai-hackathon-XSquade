from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.event import SecurityEventResponse


class ResponseActionBase(BaseModel):
    action: str
    priority: str = "MEDIUM"
    reason: str
    status: str = "RECOMMENDED"


class ResponseActionResponse(ResponseActionBase):
    id: int
    incident_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResponseActionStatusUpdate(BaseModel):
    status: str = Field(..., description="RECOMMENDED, APPROVED, or COMPLETED")


class RiskFactorItem(BaseModel):
    indicator: str
    evidence: str
    contribution: int


class IncidentBase(BaseModel):
    title: str
    description: str
    severity: str = "MEDIUM"
    risk_score: int = Field(ge=0, le=100)
    status: str = "OPEN"
    attack_type: str = "Suspicious Activity"
    affected_user: str
    affected_asset: str
    confidence: int = Field(ge=0, le=100, default=85)


class IncidentCreate(IncidentBase):
    id: Optional[str] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    event_ids: List[int] = Field(default_factory=list)


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="OPEN, INVESTIGATING, CONTAINED, or RESOLVED")


class IncidentResponse(IncidentBase):
    id: str
    first_seen: datetime
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    event_count: int = 0

    class Config:
        from_attributes = True


class IncidentDetailResponse(IncidentResponse):
    ai_summary: Optional[str] = None
    attack_hypothesis: Optional[str] = None
    why_dangerous: Optional[str] = None
    analyst_notes: Optional[str] = None
    risk_factors: List[RiskFactorItem] = Field(default_factory=list)
    events: List[SecurityEventResponse] = Field(default_factory=list)
    actions: List[ResponseActionResponse] = Field(default_factory=list)


class IncidentListResponse(BaseModel):
    total: int
    incidents: List[IncidentResponse]
