from datetime import datetime, timedelta
import uuid
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.event import SecurityEvent
from app.models.incident import Incident, IncidentEvent
from app.models.response_action import ResponseAction
from app.services.risk_service import RiskService
from app.config import settings


class CorrelationService:
    @staticmethod
    def correlate_events(db: Session, event_ids: List[int]) -> List[Incident]:
        """
        Correlates specified events into incidents based on username, IP, device, host, and time window.
        Returns list of created or updated Incidents.
        """
        if not event_ids:
            return []

        events = (
            db.query(SecurityEvent)
            .filter(SecurityEvent.id.in_(event_ids))
            .order_by(SecurityEvent.timestamp.asc())
            .all()
        )
        if not events:
            return []

        affected_incidents: List[Incident] = []
        # Group events by primary entity (username or source_ip)
        clusters = {}
        for event in events:
            key = event.username or event.source_ip or "system"
            if key not in clusters:
                clusters[key] = []
            clusters[key].append(event)

        for cluster_key, cluster_events in clusters.items():
            first_event = cluster_events[0]
            last_event = cluster_events[-1]
            time_window_start = first_event.timestamp - timedelta(minutes=settings.CORRELATION_WINDOW_MINUTES)
            time_window_end = last_event.timestamp + timedelta(minutes=settings.CORRELATION_WINDOW_MINUTES)

            # Check if there's an existing open/investigating incident matching this user/asset
            existing_incident = (
                db.query(Incident)
                .filter(
                    Incident.status.in_(["OPEN", "INVESTIGATING"]),
                    (Incident.affected_user == first_event.username) | 
                    (Incident.affected_asset == (first_event.hostname or first_event.device_id or first_event.source_ip)),
                    Incident.last_seen >= time_window_start,
                    Incident.first_seen <= time_window_end
                )
                .first()
            )

            if existing_incident:
                incident = existing_incident
                # Link newly arrived events that aren't already linked
                existing_event_ids = {
                    ie.event_id for ie in db.query(IncidentEvent).filter_by(incident_id=incident.id).all()
                }
                for ev in cluster_events:
                    if ev.id not in existing_event_ids:
                        db.add(IncidentEvent(incident_id=incident.id, event_id=ev.id))

                if last_event.timestamp > incident.last_seen:
                    incident.last_seen = last_event.timestamp
                if first_event.timestamp < incident.first_seen:
                    incident.first_seen = first_event.timestamp
            else:
                # Create a new incident
                incident_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
                
                # Determine title and attack type
                title, attack_type, description = CorrelationService._synthesize_incident_meta(cluster_events)
                
                incident = Incident(
                    id=incident_id,
                    title=title,
                    description=description,
                    status="INVESTIGATING",
                    attack_type=attack_type,
                    affected_user=first_event.username,
                    affected_asset=first_event.hostname or first_event.device_id or first_event.source_ip or "workstation-01",
                    first_seen=first_event.timestamp,
                    last_seen=last_event.timestamp,
                    confidence=85,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(incident)
                db.flush()

                # Link events
                for ev in cluster_events:
                    db.add(IncidentEvent(incident_id=incident.id, event_id=ev.id))

            db.flush()

            # Now recalculate complete risk score based on all linked events
            all_linked_events = (
                db.query(SecurityEvent)
                .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
                .filter(IncidentEvent.incident_id == incident.id)
                .order_by(SecurityEvent.timestamp.asc())
                .all()
            )

            risk_score, severity, risk_factors = RiskService.calculate_risk(all_linked_events)
            incident.risk_score = risk_score
            incident.severity = severity
            incident.risk_factors = risk_factors

            # Update attack type and title if critical patterns emerge
            title, attack_type, desc = CorrelationService._synthesize_incident_meta(all_linked_events)
            incident.title = title
            incident.attack_type = attack_type
            if not incident.description or len(incident.description) < len(desc):
                incident.description = desc

            # Confidence increases with more correlated indicators
            incident.confidence = min(98, 75 + len(risk_factors) * 4)

            # Generate default response recommendations if none exist yet
            existing_actions_count = db.query(ResponseAction).filter_by(incident_id=incident.id).count()
            if existing_actions_count == 0:
                actions = CorrelationService._generate_default_recommendations(incident, all_linked_events)
                for act in actions:
                    db.add(act)

            db.flush()
            affected_incidents.append(incident)

        db.commit()
        return affected_incidents

    @staticmethod
    def _synthesize_incident_meta(events: List[SecurityEvent]) -> Tuple[str, str, str]:
        types = {e.event_type for e in events}
        user = events[0].username if events else "unknown"

        if "LOGIN_FAILED" in types and ("PRIVILEGE_CHANGE" in types or "DATA_TRANSFER" in types):
            return (
                "Possible Account Takeover + Privilege Escalation + Data Exfiltration",
                "Account Takeover",
                f"Coordinated attack chain detected against user '{user}': multiple failed logins followed by authenticated access, administrative privilege elevation, and outbound data movement."
            )
        elif "LOGIN_FAILED" in types and "LOGIN_SUCCESS" in types:
            return (
                "Possible Account Takeover",
                "Account Compromise",
                f"Suspicious authentication activity for user '{user}': multiple login failures followed by immediate login success from an anomalous endpoint."
            )
        elif "PRIVILEGE_CHANGE" in types:
            return (
                "Unauthorized Privilege Escalation",
                "Privilege Escalation",
                f"User account '{user}' was elevated to administrative role without standard security change authorization."
            )
        elif "DATA_TRANSFER" in types:
            return (
                "Suspicious Outbound Data Exfiltration",
                "Data Exfiltration",
                f"Abnormal large volume data transfer detected originating from user '{user}' session."
            )
        elif "PROCESS_STARTED" in types:
            return (
                "Suspicious Process Execution",
                "Command & Control / Execution",
                f"High-risk command shell or credential dumper invoked in context of user '{user}'."
            )
        else:
            return (
                f"Correlated Suspicious Activity — {user}",
                "Anomalous Activity",
                f"Multiple anomalous security events detected across security monitoring telemetry for user '{user}'."
            )

    @staticmethod
    def _generate_default_recommendations(incident: Incident, events: List[SecurityEvent]) -> List[ResponseAction]:
        types = {e.event_type for e in events}
        recs = []

        # High priority immediate containment recommendations
        if "LOGIN_FAILED" in types or "LOGIN_SUCCESS" in types or incident.severity in ("HIGH", "CRITICAL"):
            recs.append(ResponseAction(
                incident_id=incident.id,
                action="Revoke active sessions and force immediate password reset",
                priority="HIGH",
                reason="Prevent continued unauthorized access across all identity providers.",
                status="RECOMMENDED"
            ))
            recs.append(ResponseAction(
                incident_id=incident.id,
                action="Enforce mandatory Multi-Factor Authentication (MFA) re-enrollment",
                priority="HIGH",
                reason="Ensure account credentials cannot be re-used even if compromised.",
                status="RECOMMENDED"
            ))

        if "PRIVILEGE_CHANGE" in types:
            recs.append(ResponseAction(
                incident_id=incident.id,
                action="Revert unauthorized administrative privileges",
                priority="HIGH",
                reason="Minimize blast radius and prevent attacker from modifying security policies or access controls.",
                status="RECOMMENDED"
            ))

        if "DATA_TRANSFER" in types:
            recs.append(ResponseAction(
                incident_id=incident.id,
                action="Block outbound traffic to destination IP address at perimeter firewall",
                priority="HIGH",
                reason="Halt ongoing exfiltration of sensitive enterprise data.",
                status="RECOMMENDED"
            ))

        recs.append(ResponseAction(
            incident_id=incident.id,
            action="Isolate affected endpoint asset for forensic investigation",
            priority="MEDIUM",
            reason="Preserve volatile RAM artifacts and prevent lateral movement across enterprise subnets.",
            status="RECOMMENDED"
        ))

        recs.append(ResponseAction(
            incident_id=incident.id,
            action="Preserve audit logs and memory dump for forensic analysis",
            priority="LOW",
            reason="Establish evidentiary chain of custody for legal and compliance disclosure.",
            status="RECOMMENDED"
        ))

        return recs
