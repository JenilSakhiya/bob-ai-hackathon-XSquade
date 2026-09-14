from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentEvent
from app.models.event import SecurityEvent
from app.models.response_action import ResponseAction
from app.ai import get_ai_provider
from app.schemas.investigation import InvestigationResult
from app.schemas.incident import RiskFactorItem, ResponseActionBase


class InvestigationService:
    @staticmethod
    def run_investigation(db: Session, incident_id: str) -> InvestigationResult:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident '{incident_id}' not found.")

        # Retrieve related events
        events = (
            db.query(SecurityEvent)
            .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
            .filter(IncidentEvent.incident_id == incident.id)
            .order_by(SecurityEvent.timestamp.asc())
            .all()
        )

        ai_provider = get_ai_provider()
        asset_info = {
            "hostname": incident.affected_asset,
            "user": incident.affected_user,
            "status": incident.status
        }

        # Run AI investigation
        inv_data = ai_provider.investigate_incident(
            incident=incident,
            events=events,
            risk_score=incident.risk_score,
            risk_factors=incident.risk_factors,
            asset_info=asset_info
        )

        # Update Incident entity with AI insights
        incident.ai_summary = inv_data.get("incident_summary")
        incident.attack_hypothesis = inv_data.get("attack_hypothesis")
        incident.why_dangerous = inv_data.get("why_suspicious")
        incident.analyst_notes = inv_data.get("analyst_notes")
        incident.confidence = inv_data.get("confidence", incident.confidence)

        # Ensure response actions are populated
        if not incident.actions:
            rec_actions = ai_provider.generate_response_plan(incident, events)
            for act in rec_actions:
                db.add(ResponseAction(
                    incident_id=incident.id,
                    action=act["action"],
                    priority=act.get("priority", "MEDIUM"),
                    reason=act["reason"],
                    status=act.get("status", "RECOMMENDED")
                ))

        db.commit()
        db.refresh(incident)

        # Format output
        risk_factor_items = [
            RiskFactorItem(
                indicator=rf.get("indicator", "Risk Indicator"),
                evidence=rf.get("evidence", ""),
                contribution=rf.get("contribution", 0)
            )
            for rf in incident.risk_factors
        ]

        action_items = [
            ResponseActionBase(
                action=a.action,
                priority=a.priority,
                reason=a.reason,
                status=a.status
            )
            for a in incident.actions
        ]

        return InvestigationResult(
            incident_id=incident.id,
            incident_summary=incident.ai_summary or "",
            attack_hypothesis=incident.attack_hypothesis or "",
            why_suspicious=incident.why_dangerous or "",
            confidence=incident.confidence,
            affected_assets=[incident.affected_asset],
            risk_score=incident.risk_score,
            severity=incident.severity,
            risk_factors=risk_factor_items,
            recommended_actions=action_items,
            analyst_notes=incident.analyst_notes or ""
        )
