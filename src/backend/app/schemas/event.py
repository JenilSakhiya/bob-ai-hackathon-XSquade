from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class SecurityEventBase(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str
    username: str
    source_ip: str
    destination_ip: Optional[str] = None
    device_id: Optional[str] = None
    hostname: Optional[str] = None
    location: Optional[str] = "Unknown"
    severity: str = "LOW"
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventResponse(SecurityEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_event(cls, event):
        return cls(
            id=event.id,
            timestamp=event.timestamp,
            event_type=event.event_type,
            username=event.username,
            source_ip=event.source_ip,
            destination_ip=event.destination_ip,
            device_id=event.device_id,
            hostname=event.hostname,
            location=event.location,
            severity=event.severity,
            description=event.description,
            metadata=event.event_metadata,
            created_at=event.created_at,
        )


class EventListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    events: List[SecurityEventResponse]
