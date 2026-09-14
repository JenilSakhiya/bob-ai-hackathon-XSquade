from datetime import datetime, timedelta
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.event import SecurityEvent
from app.models.incident import Incident, IncidentEvent
from app.services.detection_service import DetectionService
from app.services.correlation_service import CorrelationService
from app.services.investigation_service import InvestigationService
from app.schemas.simulation import SimulationResult, SimulationStep
from app.schemas.incident import IncidentDetailResponse
from app.schemas.event import SecurityEventResponse
from app.schemas.incident import RiskFactorItem, ResponseActionResponse


class SimulationService:
    @staticmethod
    def run_full_attack(db: Session, target_user: str = "admin01", target_asset: str = "workstation-42") -> SimulationResult:
        """
        Executes the Primary Demo Scenario:
        09:10 — Multiple failed login attempts
        09:11 — Multiple failed login attempts
        09:12 — Login succeeds from an unusual IP
        09:13 — Login originates from a new device
        09:15 — User requests elevated privileges
        09:16 — Privileges change from normal user to administrator
        09:18 — Suspicious process starts
        09:20 — Large outbound data transfer begins
        09:22 — 8 GB of data transferred
        """
        base_time = datetime.utcnow().replace(second=0, microsecond=0) - timedelta(minutes=15)
        attacker_ip = "198.51.100.23"  # RFC 5737 reserved documentation IP
        dest_ip = "203.0.113.88"      # RFC 5737 external command & control / drop server
        new_device_id = "DEV-UNTRUSTED-992"

        timeline_definitions = [
            {
                "offset_min": 0,
                "event_type": "LOGIN_FAILED",
                "severity": "LOW",
                "description": f"Failed password authentication attempt for user '{target_user}'",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"attempt_count": 8, "auth_protocol": "NTLMv2", "reason": "Invalid credentials"}
            },
            {
                "offset_min": 1,
                "event_type": "LOGIN_FAILED",
                "severity": "LOW",
                "description": f"Additional 9 rapid failed authentication attempts for user '{target_user}' (Brute-force spray)",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"attempt_count": 9, "auth_protocol": "Kerberos", "reason": "Pre-authentication failed"}
            },
            {
                "offset_min": 2,
                "event_type": "LOGIN_SUCCESS",
                "severity": "HIGH",
                "description": f"Successful authentication for '{target_user}' from unusual IP {attacker_ip}",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"session_id": "SESS-77341", "mfa_prompted": False, "anomalous_ip": True}
            },
            {
                "offset_min": 3,
                "event_type": "NEW_DEVICE",
                "severity": "MEDIUM",
                "description": f"First-time authentication from unmanaged hardware identifier: {new_device_id}",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"is_new_device": True, "os": "Kali Linux / WinPE emulator", "mac_hash": "a4:b2:c1:09"}
            },
            {
                "offset_min": 5,
                "event_type": "PRIVILEGE_CHANGE",
                "severity": "HIGH",
                "description": f"User '{target_user}' requested elevation to Domain Administrator role",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"requested_role": "Domain Admins", "ticket": "SEC-OVERRIDE"}
            },
            {
                "offset_min": 6,
                "event_type": "PRIVILEGE_CHANGE",
                "severity": "CRITICAL",
                "description": f"Privileges modified: '{target_user}' elevated from standard user to administrator",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"from_role": "Standard User", "to_role": "Domain Administrator", "approved_by": "SELF_MOD"}
            },
            {
                "offset_min": 8,
                "event_type": "PROCESS_STARTED",
                "severity": "HIGH",
                "description": "Suspicious process executed: powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc",
                "source_ip": attacker_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"process_name": "powershell.exe", "parent_process": "wmiprvse.exe", "pid": 4812, "is_unsigned": True}
            },
            {
                "offset_min": 10,
                "event_type": "DATA_TRANSFER",
                "severity": "HIGH",
                "description": f"Large outbound data transfer stream initiated to remote destination {dest_ip}",
                "source_ip": attacker_ip,
                "destination_ip": dest_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"protocol": "HTTPS/443", "bytes": 1024 * 1024 * 1024}
            },
            {
                "offset_min": 12,
                "event_type": "DATA_TRANSFER",
                "severity": "CRITICAL",
                "description": f"8 GB of archive data transferred to external host {dest_ip}",
                "source_ip": attacker_ip,
                "destination_ip": dest_ip,
                "device_id": new_device_id,
                "location": "Eastern Europe (Tor Exit)",
                "metadata": {"protocol": "SFTP/22", "bytes_transferred": 8 * 1024 * 1024 * 1024, "archive_name": "corp_q3_financials.7z"}
            }
        ]

        created_events: List[SecurityEvent] = []
        simulation_steps: List[SimulationStep] = []

        # 1. Insert events into DB
        for item in timeline_definitions:
            event_time = base_time + timedelta(minutes=item["offset_min"])
            event = SecurityEvent(
                timestamp=event_time,
                event_type=item["event_type"],
                username=target_user,
                source_ip=item["source_ip"],
                destination_ip=item.get("destination_ip"),
                device_id=item["device_id"],
                hostname=target_asset,
                location=item["location"],
                severity=item["severity"],
                description=item["description"],
                metadata_raw=json.dumps(item["metadata"])
            )
            db.add(event)
            db.flush()
            created_events.append(event)

            # Evaluate detection rules on each event
            DetectionService.evaluate_event(db, event)

            simulation_steps.append(SimulationStep(
                time_offset=f"+{item['offset_min']:02d}:00",
                event_type=item["event_type"],
                description=item["description"],
                status="EMITTED"
            ))

        db.commit()

        # 2. Run correlation across newly created events
        event_ids = [e.id for e in created_events]
        correlated_incidents = CorrelationService.correlate_events(db, event_ids)
        target_incident = correlated_incidents[0] if correlated_incidents else None

        # 3. If incident created, run AI investigation
        if target_incident:
            InvestigationService.run_investigation(db, target_incident.id)
            db.refresh(target_incident)

        incident_detail = None
        if target_incident:
            incident_detail = SimulationService._format_incident_detail(db, target_incident)

        return SimulationResult(
            simulation_name="Possible Account Takeover + Privilege Escalation + Data Exfiltration",
            incident_id=target_incident.id if target_incident else None,
            events_generated=len(created_events),
            incident=incident_detail,
            steps=simulation_steps,
            message="Full attack chain simulated, correlated, and investigated by CyberSentinel AI Engine."
        )

    @staticmethod
    def run_brute_force(db: Session) -> SimulationResult:
        base_time = datetime.utcnow() - timedelta(minutes=5)
        user = "s.connor"
        ip = "198.51.100.91"
        steps = []
        created_events = []

        for i in range(6):
            ev = SecurityEvent(
                timestamp=base_time + timedelta(seconds=i * 20),
                event_type="LOGIN_FAILED",
                username=user,
                source_ip=ip,
                device_id="DEV-EXTERNAL-01",
                hostname="auth-proxy-01",
                location="Eastern Europe",
                severity="LOW" if i < 4 else "HIGH",
                description=f"Authentication failure attempt #{i+1} against SSH service",
                metadata_raw=json.dumps({"service": "sshd", "attempt": i + 1})
            )
            db.add(ev)
            db.flush()
            created_events.append(ev)
            steps.append(SimulationStep(
                time_offset=f"+00:{i*20:02d}",
                event_type="LOGIN_FAILED",
                description=f"Failed SSH login attempt #{i+1} for '{user}'"
            ))

        db.commit()
        incidents = CorrelationService.correlate_events(db, [e.id for e in created_events])
        target_inc = incidents[0] if incidents else None
        if target_inc:
            InvestigationService.run_investigation(db, target_inc.id)

        return SimulationResult(
            simulation_name="Brute Force Authentication Spray",
            incident_id=target_inc.id if target_inc else None,
            events_generated=len(created_events),
            incident=SimulationService._format_incident_detail(db, target_inc) if target_inc else None,
            steps=steps,
            message="Simulated 6 rapid failed authentication attempts triggering BRUTE_FORCE_SUSPECTED."
        )

    @staticmethod
    def run_account_takeover(db: Session) -> SimulationResult:
        base_time = datetime.utcnow() - timedelta(minutes=8)
        user = "m.smith"
        attacker_ip = "198.51.100.44"
        device = "DEV-UNKNOWN-881"
        steps = []
        created_events = []

        ev1 = SecurityEvent(
            timestamp=base_time,
            event_type="LOGIN_FAILED",
            username=user,
            source_ip=attacker_ip,
            device_id=device,
            hostname="vpn-gateway",
            location="Unknown",
            severity="LOW",
            description=f"Failed VPN password check for '{user}'",
            metadata_raw="{}"
        )
        ev2 = SecurityEvent(
            timestamp=base_time + timedelta(minutes=1),
            event_type="LOGIN_FAILED",
            username=user,
            source_ip=attacker_ip,
            device_id=device,
            hostname="vpn-gateway",
            location="Unknown",
            severity="LOW",
            description=f"Second failed VPN authentication for '{user}'",
            metadata_raw="{}"
        )
        ev3 = SecurityEvent(
            timestamp=base_time + timedelta(minutes=2),
            event_type="LOGIN_SUCCESS",
            username=user,
            source_ip=attacker_ip,
            device_id=device,
            hostname="vpn-gateway",
            location="Unknown",
            severity="HIGH",
            description=f"Successful VPN connection for '{user}' from unrecognized IP {attacker_ip}",
            metadata_raw=json.dumps({"is_new_device": True})
        )
        ev4 = SecurityEvent(
            timestamp=base_time + timedelta(minutes=3),
            event_type="NEW_DEVICE",
            username=user,
            source_ip=attacker_ip,
            device_id=device,
            hostname="vpn-gateway",
            location="Unknown",
            severity="MEDIUM",
            description=f"Device fingerprint {device} not present in corporate asset inventory",
            metadata_raw="{}"
        )

        for e in [ev1, ev2, ev3, ev4]:
            db.add(e)
            db.flush()
            created_events.append(e)
            steps.append(SimulationStep(
                time_offset="+0" + str(len(steps)) + ":00",
                event_type=e.event_type,
                description=e.description
            ))

        db.commit()
        incidents = CorrelationService.correlate_events(db, [e.id for e in created_events])
        target_inc = incidents[0] if incidents else None
        if target_inc:
            InvestigationService.run_investigation(db, target_inc.id)

        return SimulationResult(
            simulation_name="Account Compromise from New Device",
            incident_id=target_inc.id if target_inc else None,
            events_generated=len(created_events),
            incident=SimulationService._format_incident_detail(db, target_inc) if target_inc else None,
            steps=steps,
            message="Simulated credential spray followed by unauthorized login from unknown device."
        )

    @staticmethod
    def run_data_exfiltration(db: Session) -> SimulationResult:
        base_time = datetime.utcnow() - timedelta(minutes=6)
        user = "developer03"
        asset = "build-server-09"
        dest_ip = "203.0.113.195"
        steps = []
        created_events = []

        ev1 = SecurityEvent(
            timestamp=base_time,
            event_type="PROCESS_STARTED",
            username=user,
            source_ip="192.168.1.109",
            destination_ip=None,
            device_id="DEV-BUILD-09",
            hostname=asset,
            location="Internal Lab",
            severity="HIGH",
            description="Archive utility invoked: 7z.exe a -p***** source_backup.7z C:\\repo",
            metadata_raw=json.dumps({"process_name": "7z.exe"})
        )
        ev2 = SecurityEvent(
            timestamp=base_time + timedelta(minutes=2),
            event_type="DATA_TRANSFER",
            username=user,
            source_ip="192.168.1.109",
            destination_ip=dest_ip,
            device_id="DEV-BUILD-09",
            hostname=asset,
            location="Internal Lab",
            severity="CRITICAL",
            description=f"3.5 GB uploaded to unclassified external storage host {dest_ip}",
            metadata_raw=json.dumps({"bytes_transferred": int(3.5 * 1024 * 1024 * 1024)})
        )

        for e in [ev1, ev2]:
            db.add(e)
            db.flush()
            created_events.append(e)
            steps.append(SimulationStep(
                time_offset="+0" + str(len(steps) * 2) + ":00",
                event_type=e.event_type,
                description=e.description
            ))

        db.commit()
        incidents = CorrelationService.correlate_events(db, [e.id for e in created_events])
        target_inc = incidents[0] if incidents else None
        if target_inc:
            InvestigationService.run_investigation(db, target_inc.id)

        return SimulationResult(
            simulation_name="Suspicious Archive & Data Exfiltration",
            incident_id=target_inc.id if target_inc else None,
            events_generated=len(created_events),
            incident=SimulationService._format_incident_detail(db, target_inc) if target_inc else None,
            steps=steps,
            message="Simulated unauthorized archiving and high-volume external data transmission."
        )

    @staticmethod
    def _format_incident_detail(db: Session, incident: Incident) -> IncidentDetailResponse:
        events = (
            db.query(SecurityEvent)
            .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
            .filter(IncidentEvent.incident_id == incident.id)
            .order_by(SecurityEvent.timestamp.asc())
            .all()
        )

        event_responses = [SecurityEventResponse.from_orm_event(e) for e in events]
        action_responses = [ResponseActionResponse.model_validate(a) for a in (incident.actions or [])]
        risk_items = [
            RiskFactorItem(
                indicator=rf.get("indicator", "Risk Indicator"),
                evidence=rf.get("evidence", ""),
                contribution=rf.get("contribution", 0)
            )
            for rf in incident.risk_factors
        ]

        return IncidentDetailResponse(
            id=incident.id,
            title=incident.title,
            description=incident.description,
            severity=incident.severity,
            risk_score=incident.risk_score,
            status=incident.status,
            attack_type=incident.attack_type,
            affected_user=incident.affected_user,
            affected_asset=incident.affected_asset,
            confidence=incident.confidence,
            first_seen=incident.first_seen,
            last_seen=incident.last_seen,
            created_at=incident.created_at,
            updated_at=incident.updated_at,
            event_count=len(events),
            ai_summary=incident.ai_summary,
            attack_hypothesis=incident.attack_hypothesis,
            why_dangerous=incident.why_dangerous,
            analyst_notes=incident.analyst_notes,
            risk_factors=risk_items,
            events=event_responses,
            actions=action_responses
        )
