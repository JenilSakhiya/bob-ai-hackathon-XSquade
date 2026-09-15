from datetime import datetime, timedelta
import random
import json
from sqlalchemy.orm import Session
from app.database import Base
from app.models.event import SecurityEvent
from app.models.incident import Incident, IncidentEvent
from app.models.response_action import ResponseAction
from app.models.chat_message import ChatMessage
from app.services.correlation_service import CorrelationService
from app.services.investigation_service import InvestigationService
from app.services.simulation_service import SimulationService

USERS = [
    "j.doe", "s.connor", "m.smith", "a.turing", "e.lovelace",
    "b.wayne", "p.parker", "d.prince", "c.kent", "admin01", "sec_ops"
]

ASSETS = [
    "workstation-04", "workstation-12", "workstation-42", "fileserver-01",
    "domain-controller-01", "db-prod-02", "vpn-gw-external", "mail-edge-01"
]

LOCATIONS = [
    "US-East (HQ)", "US-West (Branch)", "EU-Central", "Asia-Pacific", "Remote / VPN", "Eastern Europe"
]

EVENT_TYPES_BASELINE = [
    ("LOGIN_SUCCESS", "Successful authentication via Single Sign-On (SSO)", "LOW"),
    ("FILE_ACCESS", "Accessed document from internal share /data/shares/reports", "LOW"),
    ("FIREWALL_ALERT", "Inbound ICMP probe dropped by external gateway policy", "LOW"),
    ("LOGIN_FAILED", "Failed authentication attempt (Password typo or expired cached token)", "LOW"),
    ("PROCESS_STARTED", "Standard business process execution: outlook.exe / excel.exe", "LOW"),
]


def seed_database(db: Session, force: bool = False):
    """
    Seeds the database with realistic baseline events and historical incidents.
    """
    Base.metadata.create_all(bind=db.get_bind())

    existing_events_count = db.query(SecurityEvent).count()
    if existing_events_count > 0 and not force:
        return

    if force:
        # Clear existing data
        db.query(ChatMessage).delete()
        db.query(ResponseAction).delete()
        db.query(IncidentEvent).delete()
        db.query(Incident).delete()
        db.query(SecurityEvent).delete()
        db.commit()

    now = datetime.utcnow()

    # 1. Generate 140 baseline routine events across the last 24 hours
    for i in range(140):
        t = now - timedelta(hours=random.uniform(1, 24))
        user = random.choice(USERS)
        asset = random.choice(ASSETS)
        loc = random.choice(LOCATIONS[:5])
        ev_type, desc, sev = random.choice(EVENT_TYPES_BASELINE)
        src_ip = f"10.0.{random.randint(1, 20)}.{random.randint(2, 250)}"

        ev = SecurityEvent(
            timestamp=t,
            event_type=ev_type,
            username=user,
            source_ip=src_ip,
            destination_ip="10.0.0.1",
            device_id=f"DEV-{user[:3].upper()}-{random.randint(100, 999)}",
            hostname=asset,
            location=loc,
            severity=sev,
            description=f"{desc} for user '{user}'",
            metadata_raw=json.dumps({"routine": True, "category": "baseline_telemetry"})
        )
        db.add(ev)

    db.flush()

    # 2. Historical Incident 1: Suspicious Port Reconnaissance (MEDIUM)
    inc1_time = now - timedelta(hours=14)
    user1 = "b.wayne"
    attacker_ip1 = "198.51.100.12"
    evs_inc1 = []
    for port in [22, 80, 443, 445, 3389, 8080]:
        e = SecurityEvent(
            timestamp=inc1_time + timedelta(seconds=port),
            event_type="FIREWALL_ALERT",
            username=user1,
            source_ip=attacker_ip1,
            destination_ip="10.0.1.5",
            device_id="DEV-UNKNOWN-EXT",
            hostname="firewall-edge-01",
            location="Unknown",
            severity="MEDIUM",
            description=f"Port scan probe blocked targeting TCP port {port}",
            metadata_raw=json.dumps({"port": port, "protocol": "TCP"})
        )
        db.add(e)
        evs_inc1.append(e)

    # 3. Historical Incident 2: Repeated Authentication Failures (MEDIUM)
    inc2_time = now - timedelta(hours=8)
    user2 = "a.turing"
    attacker_ip2 = "198.51.100.77"
    evs_inc2 = []
    for i in range(5):
        e = SecurityEvent(
            timestamp=inc2_time + timedelta(minutes=i),
            event_type="LOGIN_FAILED",
            username=user2,
            source_ip=attacker_ip2,
            device_id="DEV-PROBE-02",
            hostname="mail-edge-01",
            location="Remote / VPN",
            severity="LOW" if i < 3 else "MEDIUM",
            description=f"Kerberos pre-auth failed for account '{user2}'",
            metadata_raw=json.dumps({"failure_count": i + 1})
        )
        db.add(e)
        evs_inc2.append(e)

    # 4. Historical Incident 3: Suspicious Script Execution (HIGH)
    inc3_time = now - timedelta(hours=4)
    user3 = "p.parker"
    asset3 = "workstation-12"
    evs_inc3 = []
    ev_proc = SecurityEvent(
        timestamp=inc3_time,
        event_type="PROCESS_STARTED",
        username=user3,
        source_ip="10.0.4.19",
        device_id="DEV-WRK-12",
        hostname=asset3,
        location="US-East (HQ)",
        severity="HIGH",
        description="Unsigned administrative utility launched: cmd.exe /c whoami /priv",
        metadata_raw=json.dumps({"process_name": "cmd.exe", "is_unsigned": True})
    )
    db.add(ev_proc)
    evs_inc3.append(ev_proc)

    ev_priv = SecurityEvent(
        timestamp=inc3_time + timedelta(minutes=2),
        event_type="PRIVILEGE_CHANGE",
        username=user3,
        source_ip="10.0.4.19",
        device_id="DEV-WRK-12",
        hostname=asset3,
        location="US-East (HQ)",
        severity="HIGH",
        description=f"Account '{user3}' attempted local token elevation on host '{asset3}'",
        metadata_raw=json.dumps({"to_role": "local_admin"})
    )
    db.add(ev_priv)
    evs_inc3.append(ev_priv)

    # 5. Historical Incident 4: Suspicious PowerShell Download Cradle (HIGH)
    inc4_time = now - timedelta(hours=6)
    user4 = "s.connor"
    asset4 = "workstation-04"
    ev_ps = SecurityEvent(
        timestamp=inc4_time,
        event_type="PROCESS_STARTED",
        username=user4,
        source_ip="10.0.2.88",
        device_id="DEV-WRK-04",
        hostname=asset4,
        location="US-West (Branch)",
        severity="HIGH",
        description="PowerShell execution with obfuscated arguments: powershell.exe -enc SQBFAFgA...",
        metadata_raw=json.dumps({"process_name": "powershell.exe", "is_unsigned": True})
    )
    ev_drop = SecurityEvent(
        timestamp=inc4_time + timedelta(minutes=1),
        event_type="FILE_ACCESS",
        username=user4,
        source_ip="10.0.2.88",
        device_id="DEV-WRK-04",
        hostname=asset4,
        location="US-West (Branch)",
        severity="MEDIUM",
        description="Executable file dropped in AppData/Local/Temp/payload.bin",
        metadata_raw=json.dumps({"file_path": "AppData/Local/Temp/payload.bin"})
    )
    db.add(ev_ps)
    db.add(ev_drop)

    # 6. Historical Incident 5: Potential Lateral Movement via WMI (HIGH)
    inc5_time = now - timedelta(hours=10)
    user5 = "m.smith"
    asset5 = "db-prod-02"
    ev_wmi1 = SecurityEvent(
        timestamp=inc5_time,
        event_type="PROCESS_STARTED",
        username=user5,
        source_ip="10.0.3.45",
        device_id="DEV-WRK-45",
        hostname=asset5,
        location="US-East (HQ)",
        severity="HIGH",
        description="Remote WMI process invocation targeting production database server",
        metadata_raw=json.dumps({"process_name": "wmic.exe"})
    )
    ev_wmi2 = SecurityEvent(
        timestamp=inc5_time + timedelta(minutes=3),
        event_type="PRIVILEGE_CHANGE",
        username=user5,
        source_ip="10.0.3.45",
        device_id="DEV-WRK-45",
        hostname=asset5,
        location="US-East (HQ)",
        severity="HIGH",
        description="Token impersonation of local system service account",
        metadata_raw=json.dumps({"to_role": "SYSTEM"})
    )
    db.add(ev_wmi1)
    db.add(ev_wmi2)

    # 7. Historical Incident 6: Multiple MFA Push Denials (MEDIUM)
    inc6_time = now - timedelta(hours=18)
    user6 = "e.lovelace"
    asset6 = "vpn-gw-external"
    ev_mfa1 = SecurityEvent(
        timestamp=inc6_time,
        event_type="LOGIN_FAILED",
        username=user6,
        source_ip="198.51.100.201",
        device_id="DEV-UNKNOWN-99",
        hostname=asset6,
        location="Remote / VPN",
        severity="MEDIUM",
        description="MFA push prompt explicitly denied by user",
        metadata_raw=json.dumps({"mfa_action": "DENIED"})
    )
    ev_mfa2 = SecurityEvent(
        timestamp=inc6_time + timedelta(minutes=1),
        event_type="LOGIN_FAILED",
        username=user6,
        source_ip="198.51.100.201",
        device_id="DEV-UNKNOWN-99",
        hostname=asset6,
        location="Remote / VPN",
        severity="MEDIUM",
        description="Repeated MFA push prompt timeout / fraud report flagged",
        metadata_raw=json.dumps({"mfa_action": "FRAUD_REPORT"})
    )
    db.add(ev_mfa1)
    db.add(ev_mfa2)

    # 8. Historical Incident 7: Abnormal After-Hours Data Query (MEDIUM)
    inc7_time = now - timedelta(hours=22)
    user7 = "d.prince"
    asset7 = "fileserver-01"
    ev_file1 = SecurityEvent(
        timestamp=inc7_time,
        event_type="FILE_ACCESS",
        username=user7,
        source_ip="10.0.1.199",
        device_id="DEV-WRK-199",
        hostname=asset7,
        location="US-East (HQ)",
        severity="LOW",
        description="Bulk read access on restricted financial shares outside normal business hours",
        metadata_raw=json.dumps({"records_read": 15000})
    )
    ev_file2 = SecurityEvent(
        timestamp=inc7_time + timedelta(minutes=10),
        event_type="DATA_TRANSFER",
        username=user7,
        source_ip="10.0.1.199",
        destination_ip="10.0.99.5",
        device_id="DEV-WRK-199",
        hostname=asset7,
        location="US-East (HQ)",
        severity="MEDIUM",
        description="Internal archive sync of 450 MB to staging server",
        metadata_raw=json.dumps({"bytes_transferred": 450 * 1024 * 1024})
    )
    db.add(ev_file1)
    db.add(ev_file2)

    # 9. Historical Incident 8: Perimeter Firewall Brute-Force Spray (LOW)
    inc8_time = now - timedelta(hours=20)
    user8 = "c.kent"
    asset8 = "mail-edge-01"
    ev_spray1 = SecurityEvent(
        timestamp=inc8_time,
        event_type="FIREWALL_ALERT",
        username=user8,
        source_ip="198.51.100.111",
        destination_ip="10.0.0.25",
        device_id="DEV-PROBE-99",
        hostname=asset8,
        location="Unknown",
        severity="LOW",
        description="Inbound SMTP flood rate limit threshold exceeded",
        metadata_raw=json.dumps({"pps": 150})
    )
    db.add(ev_spray1)

    db.commit()

    # Correlate historical incidents
    CorrelationService.correlate_events(db, [e.id for e in evs_inc1])
    CorrelationService.correlate_events(db, [e.id for e in evs_inc2])
    CorrelationService.correlate_events(db, [e.id for e in evs_inc3])
    CorrelationService.correlate_events(db, [ev_ps.id, ev_drop.id])
    CorrelationService.correlate_events(db, [ev_wmi1.id, ev_wmi2.id])
    CorrelationService.correlate_events(db, [ev_mfa1.id, ev_mfa2.id])
    CorrelationService.correlate_events(db, [ev_file1.id, ev_file2.id])
    CorrelationService.correlate_events(db, [ev_spray1.id])

    # 5. Create the Primary Demo Critical Incident pre-seeded so the dashboard has rich data right away
    SimulationService.run_full_attack(db, target_user="admin01", target_asset="workstation-42")

    print(f"Seed complete: {db.query(SecurityEvent).count()} events, {db.query(Incident).count()} incidents.")
