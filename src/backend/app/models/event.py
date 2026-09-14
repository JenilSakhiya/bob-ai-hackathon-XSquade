from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    event_type = Column(String(64), index=True, nullable=False)
    username = Column(String(128), index=True, nullable=False)
    source_ip = Column(String(64), index=True, nullable=False)
    destination_ip = Column(String(64), nullable=True)
    device_id = Column(String(128), index=True, nullable=True)
    hostname = Column(String(128), index=True, nullable=True)
    location = Column(String(128), nullable=True, default="Unknown")
    severity = Column(String(32), default="LOW", nullable=False)
    description = Column(Text, nullable=False)
    
    # Store JSON metadata as text to ensure cross-dialect compatibility
    metadata_raw = Column("metadata", Text, default="{}", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    @property
    def event_metadata(self) -> dict:
        try:
            return json.loads(self.metadata_raw) if self.metadata_raw else {}
        except Exception:
            return {}

    @event_metadata.setter
    def event_metadata(self, val: dict):
        self.metadata_raw = json.dumps(val or {})
