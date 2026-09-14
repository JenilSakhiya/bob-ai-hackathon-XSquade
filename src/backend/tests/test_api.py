from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.seed.seed_data import seed_database

client = TestClient(app)


def setup_module():
    db = SessionLocal()
    seed_database(db, force=True)
    db.close()


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["system"] == "OPERATIONAL"


def test_api_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "kpi" in data
    assert data["kpi"]["critical_incidents"] >= 1
    assert "events_over_time" in data
    assert "incidents_by_severity" in data


def test_api_events_list_and_filter():
    res = client.get("/api/events?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["events"]) == 10

    # Filter by severity
    res_filt = client.get("/api/events?severity=HIGH")
    assert res_filt.status_code == 200


def test_api_incidents_list_and_detail():
    res = client.get("/api/incidents")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    incident_id = data["incidents"][0]["id"]

    res_detail = client.get(f"/api/incidents/{incident_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == incident_id
    assert "events" in detail
    assert "actions" in detail
    assert "risk_factors" in detail


def test_api_incident_chat():
    res = client.get("/api/incidents?severity=CRITICAL")
    data = res.json()
    assert len(data["incidents"]) > 0
    crit_id = data["incidents"][0]["id"]

    chat_payload = {"message": "Why is this incident critical?"}
    res_chat = client.post(f"/api/incidents/{crit_id}/chat", json=chat_payload)
    assert res_chat.status_code == 200
    chat_data = res_chat.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 10
    assert "history" in chat_data


def test_api_incident_report():
    res = client.get("/api/incidents?severity=CRITICAL")
    data = res.json()
    crit_id = data["incidents"][0]["id"]

    res_report = client.post(f"/api/incidents/{crit_id}/report")
    assert res_report.status_code == 200
    rep_data = res_report.json()
    assert "markdown" in rep_data
    assert "# CyberSentinel SOC Incident Report" in rep_data["markdown"]
