from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentEvent
from app.models.event import SecurityEvent
from app.ai import get_ai_provider
from app.schemas.investigation import IncidentReportResponse
from app.schemas.incident import RiskFactorItem


class ReportService:
    @staticmethod
    def generate_incident_report(db: Session, incident_id: str) -> IncidentReportResponse:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident '{incident_id}' not found.")

        events = (
            db.query(SecurityEvent)
            .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
            .filter(IncidentEvent.incident_id == incident.id)
            .order_by(SecurityEvent.timestamp.asc())
            .all()
        )

        ai_provider = get_ai_provider()

        # Format timeline dicts
        timeline_list = [
            {
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "time_short": e.timestamp.strftime("%H:%M:%S"),
                "event_type": e.event_type,
                "description": e.description,
                "source_ip": e.source_ip,
                "severity": e.severity
            }
            for e in events
        ]

        # Format actions
        actions_list = [
            {
                "action": a.action,
                "priority": a.priority,
                "reason": a.reason,
                "status": a.status
            }
            for a in incident.actions
        ]

        # Build investigation dict
        inv_dict = {
            "incident_summary": incident.ai_summary or "",
            "attack_hypothesis": incident.attack_hypothesis or "",
            "why_suspicious": incident.why_dangerous or "",
            "analyst_notes": incident.analyst_notes or ""
        }

        # Generate markdown via AI provider
        markdown_content = ai_provider.generate_report(incident, events, inv_dict)

        risk_factor_items = [
            RiskFactorItem(
                indicator=rf.get("indicator", "Risk Indicator"),
                evidence=rf.get("evidence", ""),
                contribution=rf.get("contribution", 0)
            )
            for rf in incident.risk_factors
        ]

        return IncidentReportResponse(
            incident_id=incident.id,
            title=incident.title,
            severity=incident.severity,
            risk_score=incident.risk_score,
            confidence=incident.confidence,
            status=incident.status,
            affected_user=incident.affected_user,
            affected_asset=incident.affected_asset,
            first_seen=incident.first_seen.strftime("%Y-%m-%d %H:%M:%S"),
            last_seen=incident.last_seen.strftime("%Y-%m-%d %H:%M:%S"),
            summary=incident.ai_summary or "Suspicious multi-stage cyber attack pattern.",
            attack_hypothesis=incident.attack_hypothesis or "Account takeover and subsequent data egress.",
            why_dangerous=incident.why_dangerous or "Correlated authentication compromise and elevated privileges.",
            risk_factors=risk_factor_items,
            timeline=timeline_list,
            recommended_actions=actions_list,
            analyst_notes=incident.analyst_notes or "Pending analyst validation.",
            markdown=markdown_content
        )
