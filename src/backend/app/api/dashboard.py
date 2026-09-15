from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.event import SecurityEvent
from app.models.incident import Incident
from app.schemas.dashboard import (
    DashboardResponse,
    KPIMetrics,
    SystemStatus,
    TimeSeriesPoint,
    SeverityCount,
    AttackTypeCount,
    RiskBucketCount
)
from app.schemas.incident import IncidentResponse
from app.config import settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    day_ago = now - timedelta(hours=24)

    # 1. KPIs
    critical_count = db.query(Incident).filter(Incident.severity == "CRITICAL").count()
    high_risk_count = db.query(Incident).filter(Incident.severity == "HIGH").count()
    events_today = db.query(SecurityEvent).filter(SecurityEvent.timestamp >= day_ago).count()
    open_investigations = db.query(Incident).filter(Incident.status.in_(["OPEN", "INVESTIGATING"])).count()

    ai_provider_map = {
        "openai": f"OpenAI ({settings.OPENAI_MODEL})",
        "gemini": f"Google Gemini ({settings.GEMINI_MODEL})",
        "groq": f"Groq ({settings.GROQ_MODEL})",
    }
    system_status = SystemStatus(
        system_status="OPERATIONAL",
        ai_status="READY",
        threat_level="CRITICAL" if critical_count > 0 else "ELEVATED",
        ai_provider=ai_provider_map.get(settings.AI_PROVIDER.lower(), "Mock AI (Zero-Config Offline)")
    )

    # 3. Events Over Time (hourly buckets for the last 12 hours)
    events_over_time = []
    for h in range(11, -1, -1):
        window_start = now - timedelta(hours=h + 1)
        window_end = now - timedelta(hours=h)
        count = (
            db.query(SecurityEvent)
            .filter(SecurityEvent.timestamp >= window_start, SecurityEvent.timestamp < window_end)
            .count()
        )
        time_label = window_end.strftime("%H:%M")
        events_over_time.append(TimeSeriesPoint(time=time_label, count=count))

    # 4. Incidents By Severity
    severity_colors = {
        "CRITICAL": "#ef4444",
        "HIGH": "#f97316",
        "MEDIUM": "#eab308",
        "LOW": "#3b82f6"
    }
    incidents_by_severity = []
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        cnt = db.query(Incident).filter(Incident.severity == sev).count()
        incidents_by_severity.append(SeverityCount(severity=sev, count=cnt, color=severity_colors[sev]))

    # 5. Attack Types
    attack_type_counts = (
        db.query(Incident.attack_type, func.count(Incident.id))
        .group_by(Incident.attack_type)
        .order_by(func.count(Incident.id).desc())
        .limit(6)
        .all()
    )
    attack_types = [
        AttackTypeCount(type=row[0] or "Unknown", count=row[1])
        for row in attack_type_counts
    ]

    # 6. Risk Distribution
    risk_ranges = [
        ("0–29 Low", 0, 29),
        ("30–59 Med", 30, 59),
        ("60–79 High", 60, 79),
        ("80–100 Crit", 80, 100)
    ]
    risk_distribution = []
    for label, r_min, r_max in risk_ranges:
        cnt = db.query(Incident).filter(Incident.risk_score >= r_min, Incident.risk_score <= r_max).count()
        risk_distribution.append(RiskBucketCount(range=label, count=cnt))

    # 7. Recent Critical / High Incidents
    recent_incidents_orm = (
        db.query(Incident)
        .order_by(Incident.risk_score.desc(), Incident.last_seen.desc())
        .limit(5)
        .all()
    )
    recent_incidents = [
        IncidentResponse(
            id=inc.id,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            risk_score=inc.risk_score,
            status=inc.status,
            attack_type=inc.attack_type,
            affected_user=inc.affected_user,
            affected_asset=inc.affected_asset,
            confidence=inc.confidence,
            first_seen=inc.first_seen,
            last_seen=inc.last_seen,
            created_at=inc.created_at,
            updated_at=inc.updated_at,
            event_count=len(inc.incident_events)
        )
        for inc in recent_incidents_orm
    ]

    return DashboardResponse(
        kpi=KPIMetrics(
            critical_incidents=critical_count,
            high_risk_incidents=high_risk_count,
            events_today=events_today,
            open_investigations=open_investigations
        ),
        system_status=system_status,
        events_over_time=events_over_time,
        incidents_by_severity=incidents_by_severity,
        attack_types=attack_types,
        risk_distribution=risk_distribution,
        recent_critical_incidents=recent_incidents
    )
