import pytest
from datetime import datetime, timedelta
import json
from app.models.event import SecurityEvent
from app.services.risk_service import RiskService


def test_risk_scoring_empty_events():
    score, sev, factors = RiskService.calculate_risk([])
    assert score == 0
    assert sev == "LOW"
    assert factors == []


def test_risk_scoring_brute_force_pattern():
    events = [
        SecurityEvent(
            timestamp=datetime.utcnow(),
            event_type="LOGIN_FAILED",
            username="user1",
            source_ip="198.51.100.1",
            description="Failed login"
        )
        for _ in range(4)
    ]
    score, sev, factors = RiskService.calculate_risk(events)
    assert score >= 15
    assert any(f["indicator"] == "Failed Login Pattern" for f in factors)


def test_risk_scoring_critical_attack_chain():
    now = datetime.utcnow()
    events = [
        SecurityEvent(
            timestamp=now - timedelta(minutes=10),
            event_type="LOGIN_FAILED",
            username="admin01",
            source_ip="198.51.100.23",
            description="Failed attempt 1"
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=9),
            event_type="LOGIN_FAILED",
            username="admin01",
            source_ip="198.51.100.23",
            description="Failed attempt 2"
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=8),
            event_type="LOGIN_FAILED",
            username="admin01",
            source_ip="198.51.100.23",
            description="Failed attempt 3"
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=7),
            event_type="LOGIN_SUCCESS",
            username="admin01",
            source_ip="198.51.100.23",
            description="Successful login"
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=6),
            event_type="NEW_DEVICE",
            username="admin01",
            source_ip="198.51.100.23",
            device_id="DEV-NEW-01",
            description="New device observed",
            metadata_raw=json.dumps({"is_new_device": True})
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=5),
            event_type="PRIVILEGE_CHANGE",
            username="admin01",
            source_ip="198.51.100.23",
            description="Privilege elevation to admin",
            metadata_raw=json.dumps({"to_role": "admin"})
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=3),
            event_type="PROCESS_STARTED",
            username="admin01",
            source_ip="198.51.100.23",
            description="powershell.exe -enc",
            metadata_raw=json.dumps({"process_name": "powershell.exe"})
        ),
        SecurityEvent(
            timestamp=now - timedelta(minutes=1),
            event_type="DATA_TRANSFER",
            username="admin01",
            source_ip="198.51.100.23",
            destination_ip="203.0.113.88",
            description="8 GB of data transferred",
            metadata_raw=json.dumps({"bytes_transferred": 8 * 1024 * 1024 * 1024})
        )
    ]
    score, sev, factors = RiskService.calculate_risk(events)
    assert score >= 90
    assert sev == "CRITICAL"
    assert len(factors) >= 5
