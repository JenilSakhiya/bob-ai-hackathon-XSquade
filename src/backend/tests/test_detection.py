import pytest
from datetime import datetime, timedelta
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.event import SecurityEvent
from app.services.detection_service import DetectionService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_brute_force_detection_triggered(db_session):
    user = "test_user"
    base_time = datetime.utcnow() - timedelta(minutes=5)
    
    events = []
    for i in range(5):
        ev = SecurityEvent(
            timestamp=base_time + timedelta(minutes=i),
            event_type="LOGIN_FAILED",
            username=user,
            source_ip="198.51.100.5",
            description=f"Auth failure #{i+1}"
        )
        db_session.add(ev)
        events.append(ev)
    db_session.commit()

    findings = DetectionService.evaluate_event(db_session, events[-1])
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_BRUTE_FORCE" in rule_ids
    assert any("BRUTE_FORCE_SUSPECTED" in f.title for f in findings)


def test_login_after_brute_force_detection(db_session):
    user = "compromised_user"
    base_time = datetime.utcnow() - timedelta(minutes=4)
    
    # 3 failed logins
    for i in range(3):
        ev = SecurityEvent(
            timestamp=base_time + timedelta(minutes=i),
            event_type="LOGIN_FAILED",
            username=user,
            source_ip="198.51.100.50",
            description="Failed login"
        )
        db_session.add(ev)
    
    # Followed by 1 successful login
    success_ev = SecurityEvent(
        timestamp=base_time + timedelta(minutes=3),
        event_type="LOGIN_SUCCESS",
        username=user,
        source_ip="198.51.100.50",
        description="Login succeeded"
    )
    db_session.add(success_ev)
    db_session.commit()

    findings = DetectionService.evaluate_event(db_session, success_ev)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_LOGIN_AFTER_BRUTE_FORCE" in rule_ids


def test_privilege_escalation_detection(db_session):
    ev = SecurityEvent(
        timestamp=datetime.utcnow(),
        event_type="PRIVILEGE_CHANGE",
        username="admin_target",
        source_ip="10.0.0.5",
        description="User rights elevated to administrator",
        metadata_raw=json.dumps({"to_role": "Domain Administrator"})
    )
    db_session.add(ev)
    db_session.commit()

    findings = DetectionService.evaluate_event(db_session, ev)
    assert any(f.rule_id == "RULE_PRIVILEGE_ESCALATION" for f in findings)


def test_data_exfiltration_detection(db_session):
    ev = SecurityEvent(
        timestamp=datetime.utcnow(),
        event_type="DATA_TRANSFER",
        username="exfil_user",
        source_ip="10.0.0.10",
        destination_ip="203.0.113.9",
        description="Large egress transfer",
        metadata_raw=json.dumps({"bytes_transferred": 2 * 1024 * 1024 * 1024})  # 2 GB
    )
    db_session.add(ev)
    db_session.commit()

    findings = DetectionService.evaluate_event(db_session, ev)
    assert any(f.rule_id == "RULE_DATA_EXFILTRATION" for f in findings)


def test_suspicious_process_detection(db_session):
    ev = SecurityEvent(
        timestamp=datetime.utcnow(),
        event_type="PROCESS_STARTED",
        username="user_proc",
        source_ip="10.0.0.15",
        description="powershell.exe -enc Bypass",
        metadata_raw=json.dumps({"process_name": "powershell.exe"})
    )
    db_session.add(ev)
    db_session.commit()

    findings = DetectionService.evaluate_event(db_session, ev)
    assert any(f.rule_id == "RULE_SUSPICIOUS_PROCESS" for f in findings)
