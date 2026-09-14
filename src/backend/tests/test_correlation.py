import pytest
from datetime import datetime, timedelta
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.event import SecurityEvent
from app.models.incident import Incident, IncidentEvent
from app.services.correlation_service import CorrelationService


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_event_correlation_groups_into_incident(db_session):
    now = datetime.utcnow()
    user = "alice_dev"
    ip = "198.51.100.9"

    ev1 = SecurityEvent(
        timestamp=now - timedelta(minutes=10),
        event_type="LOGIN_FAILED",
        username=user,
        source_ip=ip,
        description="Auth fail 1"
    )
    ev2 = SecurityEvent(
        timestamp=now - timedelta(minutes=5),
        event_type="LOGIN_SUCCESS",
        username=user,
        source_ip=ip,
        description="Auth success"
    )
    ev3 = SecurityEvent(
        timestamp=now,
        event_type="PRIVILEGE_CHANGE",
        username=user,
        source_ip=ip,
        description="Privilege change",
        metadata_raw=json.dumps({"to_role": "admin"})
    )

    db_session.add_all([ev1, ev2, ev3])
    db_session.commit()

    incidents = CorrelationService.correlate_events(db_session, [ev1.id, ev2.id, ev3.id])
    assert len(incidents) == 1
    inc = incidents[0]
    assert inc.affected_user == user
    assert inc.event_count == 3 or len(inc.incident_events) == 3
    assert inc.risk_score >= 25
