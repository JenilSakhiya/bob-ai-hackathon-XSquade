from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.event import SecurityEvent
from app.schemas.event import EventListResponse, SecurityEventResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=EventListResponse)
def list_events(
    db: Session = Depends(get_db),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    username: Optional[str] = Query(None, description="Filter by username"),
    search: Optional[str] = Query(None, description="Text search across description, IP, or hostname"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page")
):
    query = db.query(SecurityEvent)

    if event_type and event_type != "ALL":
        query = query.filter(SecurityEvent.event_type == event_type)

    if severity and severity != "ALL":
        query = query.filter(SecurityEvent.severity == severity.upper())

    if username:
        query = query.filter(SecurityEvent.username.ilike(f"%{username}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                SecurityEvent.description.ilike(search_pattern),
                SecurityEvent.source_ip.ilike(search_pattern),
                SecurityEvent.destination_ip.ilike(search_pattern),
                SecurityEvent.hostname.ilike(search_pattern),
                SecurityEvent.username.ilike(search_pattern),
                SecurityEvent.device_id.ilike(search_pattern)
            )
        )

    total = query.count()
    events_orm = (
        query
        .order_by(SecurityEvent.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    events_res = [SecurityEventResponse.from_orm_event(e) for e in events_orm]

    return EventListResponse(
        total=total,
        page=page,
        page_size=page_size,
        events=events_res
    )
