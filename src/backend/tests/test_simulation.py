import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.services.simulation_service import SimulationService
from app.models.incident import Incident


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_full_attack_simulation_creates_critical_incident(db_session):
    result = SimulationService.run_full_attack(db_session, target_user="admin01", target_asset="workstation-42")

    assert result.events_generated == 9
    assert result.incident_id is not None
    assert result.incident is not None
    assert result.incident.severity == "CRITICAL"
    assert result.incident.risk_score >= 90
    assert result.incident.confidence >= 90
    assert len(result.steps) == 9
    assert len(result.incident.actions) > 0

    # Check persistence in DB
    db_inc = db_session.query(Incident).filter(Incident.id == result.incident_id).first()
    assert db_inc is not None
    assert db_inc.severity == "CRITICAL"
    assert db_inc.risk_score >= 90
