from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), index=True, nullable=False)
    event_id = Column(Integer, ForeignKey("security_events.id", ondelete="CASCADE"), index=True, nullable=False)

    event = relationship("SecurityEvent")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), default="MEDIUM", nullable=False)
    risk_score = Column(Integer, default=50, nullable=False)
    status = Column(String(32), default="OPEN", nullable=False)  # OPEN, INVESTIGATING, CONTAINED, RESOLVED
    attack_type = Column(String(128), default="Suspicious Activity", nullable=False)
    affected_user = Column(String(128), index=True, nullable=False)
    affected_asset = Column(String(128), index=True, nullable=False)
    first_seen = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen = Column(DateTime, default=datetime.utcnow, nullable=False)
    confidence = Column(Integer, default=85, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # AI Investigation & Risk Explanation outputs
    ai_summary = Column(Text, nullable=True)
    attack_hypothesis = Column(Text, nullable=True)
    why_dangerous = Column(Text, nullable=True)
    analyst_notes = Column(Text, nullable=True)
    risk_factors_raw = Column("risk_factors", Text, default="[]", nullable=False)

    # Relationships
    incident_events = relationship("IncidentEvent", backref="incident", cascade="all, delete-orphan")
    actions = relationship("ResponseAction", back_populates="incident", cascade="all, delete-orphan", order_by="ResponseAction.id")
    chat_messages = relationship("ChatMessage", back_populates="incident", cascade="all, delete-orphan", order_by="ChatMessage.id")

    @property
    def event_count(self) -> int:
        return len(self.incident_events) if self.incident_events else 0

    @property
    def risk_factors(self) -> list:
        try:
            return json.loads(self.risk_factors_raw) if self.risk_factors_raw else []
        except Exception:
            return []

    @risk_factors.setter
    def risk_factors(self, val: list):
        self.risk_factors_raw = json.dumps(val or [])
