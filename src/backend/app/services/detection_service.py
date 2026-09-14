from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.event import SecurityEvent
from app.config import settings

SUSPICIOUS_PROCESS_NAMES = {
    "powershell", "powershell.exe", "cmd", "cmd.exe", "mimikatz", "mimikatz.exe",
    "certutil", "certutil.exe", "whoami", "whoami.exe", "vssadmin", "vssadmin.exe",
    "nc", "ncat", "netcat", "psexec", "psexec.exe"
}


class DetectionFinding:
    def __init__(self, rule_id: str, title: str, severity: str, description: str, evidence_event_ids: List[int]):
        self.rule_id = rule_id
        self.title = title
        self.severity = severity
        self.description = description
        self.evidence_event_ids = evidence_event_ids

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "title": self.title,
            "severity": self.severity,
            "description": self.description,
            "evidence_event_ids": self.evidence_event_ids
        }


class DetectionService:
    @staticmethod
    def evaluate_event(db: Session, target_event: SecurityEvent) -> List[DetectionFinding]:
        """
        Evaluates an incoming event against detection rules using historical context in db.
        """
        findings: List[DetectionFinding] = []

        # Rule 1: Brute Force Detection
        # Check if user has >= 5 failed logins within BRUTE_FORCE_WINDOW_MINUTES
        if target_event.event_type == "LOGIN_FAILED":
            window_start = target_event.timestamp - timedelta(minutes=settings.BRUTE_FORCE_WINDOW_MINUTES)
            failed_events = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.username == target_event.username,
                    SecurityEvent.event_type == "LOGIN_FAILED",
                    SecurityEvent.timestamp >= window_start,
                    SecurityEvent.timestamp <= target_event.timestamp
                )
                .order_by(SecurityEvent.timestamp.asc())
                .all()
            )
            if len(failed_events) >= settings.BRUTE_FORCE_THRESHOLD:
                findings.append(DetectionFinding(
                    rule_id="RULE_BRUTE_FORCE",
                    title="BRUTE_FORCE_SUSPECTED",
                    severity="HIGH",
                    description=f"{len(failed_events)} failed login attempts detected for user '{target_event.username}' within {settings.BRUTE_FORCE_WINDOW_MINUTES} minutes.",
                    evidence_event_ids=[e.id for e in failed_events]
                ))

        # Rule 2: Successful Login After Brute Force
        # Check if LOGIN_SUCCESS occurs shortly after >= 3 failed logins within 15 min
        if target_event.event_type == "LOGIN_SUCCESS":
            window_start = target_event.timestamp - timedelta(minutes=15)
            recent_failed = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.username == target_event.username,
                    SecurityEvent.event_type == "LOGIN_FAILED",
                    SecurityEvent.timestamp >= window_start,
                    SecurityEvent.timestamp <= target_event.timestamp
                )
                .all()
            )
            if len(recent_failed) >= 3:
                findings.append(DetectionFinding(
                    rule_id="RULE_LOGIN_AFTER_BRUTE_FORCE",
                    title="POSSIBLE_ACCOUNT_COMPROMISE",
                    severity="CRITICAL",
                    description=f"Successful authentication for '{target_event.username}' immediately following {len(recent_failed)} failed login attempts from IP {target_event.source_ip}.",
                    evidence_event_ids=[e.id for e in recent_failed] + [target_event.id]
                ))

        # Rule 3: New Device Login
        # Check if device_id was previously unseen for this username
        if target_event.event_type in ("LOGIN_SUCCESS", "NEW_DEVICE") and target_event.device_id:
            prior_device_events = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.username == target_event.username,
                    SecurityEvent.device_id == target_event.device_id,
                    SecurityEvent.id != target_event.id,
                    SecurityEvent.timestamp < target_event.timestamp
                )
                .count()
            )
            # If no prior record with this device, or explicit NEW_DEVICE event
            if prior_device_events == 0 or target_event.event_type == "NEW_DEVICE":
                findings.append(DetectionFinding(
                    rule_id="RULE_NEW_DEVICE",
                    title="NEW_DEVICE_LOGIN",
                    severity="MEDIUM",
                    description=f"Authentication from previously unregistered device ID '{target_event.device_id}' for user '{target_event.username}'.",
                    evidence_event_ids=[target_event.id]
                ))

        # Rule 4: Privilege Escalation
        if target_event.event_type == "PRIVILEGE_CHANGE":
            meta = target_event.event_metadata
            to_role = str(meta.get("to_role", meta.get("new_role", ""))).lower()
            if "admin" in to_role or "root" in to_role or "elevated" in str(target_event.description).lower():
                findings.append(DetectionFinding(
                    rule_id="RULE_PRIVILEGE_ESCALATION",
                    title="PRIVILEGE_ESCALATION",
                    severity="HIGH",
                    description=f"Privilege modification to administrative role ({meta.get('to_role', 'administrator')}) granted to '{target_event.username}'.",
                    evidence_event_ids=[target_event.id]
                ))

        # Rule 5: Large Data Transfer (Exfiltration)
        if target_event.event_type == "DATA_TRANSFER":
            meta = target_event.event_metadata
            bytes_transferred = meta.get("bytes", meta.get("bytes_transferred", 0))
            if bytes_transferred >= settings.LARGE_TRANSFER_THRESHOLD_BYTES:
                gb_size = round(bytes_transferred / (1024 ** 3), 2)
                findings.append(DetectionFinding(
                    rule_id="RULE_DATA_EXFILTRATION",
                    title="POSSIBLE_DATA_EXFILTRATION",
                    severity="CRITICAL",
                    description=f"Abnormal outbound data transfer of {gb_size} GB to destination IP {target_event.destination_ip or 'external'}.",
                    evidence_event_ids=[target_event.id]
                ))

        # Rule 6: Suspicious Process Execution
        if target_event.event_type == "PROCESS_STARTED":
            meta = target_event.event_metadata
            proc_name = str(meta.get("process_name", meta.get("process", target_event.description))).lower().strip()
            if any(susp in proc_name for susp in SUSPICIOUS_PROCESS_NAMES) or meta.get("is_unsigned", False):
                findings.append(DetectionFinding(
                    rule_id="RULE_SUSPICIOUS_PROCESS",
                    title="SUSPICIOUS_PROCESS",
                    severity="HIGH",
                    description=f"Execution of high-risk process '{proc_name}' by user '{target_event.username}' on asset '{target_event.hostname or target_event.device_id}'.",
                    evidence_event_ids=[target_event.id]
                ))

        return findings
