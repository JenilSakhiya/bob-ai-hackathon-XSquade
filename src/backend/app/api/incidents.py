from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.incident import Incident, IncidentEvent
from app.models.event import SecurityEvent
from app.models.response_action import ResponseAction
from app.schemas.incident import (
    IncidentResponse,
    IncidentDetailResponse,
    IncidentListResponse,
    IncidentStatusUpdate,
    ResponseActionResponse,
    ResponseActionStatusUpdate,
    RiskFactorItem
)
from app.schemas.event import SecurityEventResponse

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=IncidentListResponse)
def list_incidents(
    db: Session = Depends(get_db),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    attack_type: Optional[str] = Query(None, description="Filter by attack type"),
    search: Optional[str] = Query(None, description="Search across title, affected_user, or affected_asset")
):
    query = db.query(Incident)

    if severity and severity != "ALL":
        query = query.filter(Incident.severity == severity.upper())

    if status_filter and status_filter != "ALL":
        query = query.filter(Incident.status == status_filter.upper())

    if attack_type and attack_type != "ALL":
        query = query.filter(Incident.attack_type.ilike(f"%{attack_type}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Incident.title.ilike(search_pattern),
                Incident.affected_user.ilike(search_pattern),
                Incident.affected_asset.ilike(search_pattern),
                Incident.id.ilike(search_pattern)
            )
        )

    total = query.count()
    incidents_orm = query.order_by(Incident.risk_score.desc(), Incident.last_seen.desc()).all()

    incidents_res = [
        IncidentResponse(
            id=inc.id,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            risk_score=inc.risk_score,
            status=inc.status,
            attack_type=inc.attack_type,
            affected_user=inc.affected_user,
            affected_asset=inc.affected_asset,
            confidence=inc.confidence,
            first_seen=inc.first_seen,
            last_seen=inc.last_seen,
            created_at=inc.created_at,
            updated_at=inc.updated_at,
            event_count=len(inc.incident_events)
        )
        for inc in incidents_orm
    ]

    return IncidentListResponse(total=total, incidents=incidents_res)


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    events = (
        db.query(SecurityEvent)
        .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
        .filter(IncidentEvent.incident_id == incident.id)
        .order_by(SecurityEvent.timestamp.asc())
        .all()
    )

    event_responses = [SecurityEventResponse.from_orm_event(e) for e in events]
    action_responses = [ResponseActionResponse.model_validate(a) for a in incident.actions]
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


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    status_update: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    valid_statuses = ["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED"]
    new_status = status_update.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}"
        )

    incident.status = new_status
    incident.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)

    return IncidentResponse(
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
        event_count=len(incident.incident_events)
    )


@router.get("/{incident_id}/timeline", response_model=List[SecurityEventResponse])
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    events = (
        db.query(SecurityEvent)
        .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
        .filter(IncidentEvent.incident_id == incident.id)
        .order_by(SecurityEvent.timestamp.asc())
        .all()
    )
    return [SecurityEventResponse.from_orm_event(e) for e in events]


@router.get("/{incident_id}/recommendations", response_model=List[ResponseActionResponse])
def get_incident_recommendations(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    return [ResponseActionResponse.model_validate(a) for a in incident.actions]


@router.patch("/{incident_id}/actions/{action_id}", response_model=ResponseActionResponse)
def update_action_status(
    incident_id: str,
    action_id: int,
    status_update: ResponseActionStatusUpdate,
    db: Session = Depends(get_db)
):
    action = (
        db.query(ResponseAction)
        .filter(ResponseAction.id == action_id, ResponseAction.incident_id == incident_id)
        .first()
    )
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response action not found.")

    valid_statuses = ["RECOMMENDED", "APPROVED", "COMPLETED"]
    new_status = status_update.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}"
        )

    action.status = new_status
    db.commit()
    db.refresh(action)
    return ResponseActionResponse.model_validate(action)
