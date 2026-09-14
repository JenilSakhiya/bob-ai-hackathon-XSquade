from typing import List
from pydantic import BaseModel
from app.schemas.incident import IncidentResponse


class KPIMetrics(BaseModel):
    critical_incidents: int
    high_risk_incidents: int
    events_today: int
    open_investigations: int


class SystemStatus(BaseModel):
    system_status: str = "OPERATIONAL"
    ai_status: str = "READY"
    threat_level: str = "ELEVATED"
    ai_provider: str = "Mock AI (Zero-Config Offline)"


class TimeSeriesPoint(BaseModel):
    time: str
    count: int


class SeverityCount(BaseModel):
    severity: str
    count: int
    color: str


class AttackTypeCount(BaseModel):
    type: str
    count: int


class RiskBucketCount(BaseModel):
    range: str
    count: int


class DashboardResponse(BaseModel):
    kpi: KPIMetrics
    system_status: SystemStatus
    events_over_time: List[TimeSeriesPoint]
    incidents_by_severity: List[SeverityCount]
    attack_types: List[AttackTypeCount]
    risk_distribution: List[RiskBucketCount]
    recent_critical_incidents: List[IncidentResponse]
