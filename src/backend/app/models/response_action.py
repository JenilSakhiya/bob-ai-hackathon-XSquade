from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), index=True, nullable=False)
    action = Column(String(255), nullable=False)
    priority = Column(String(32), default="MEDIUM", nullable=False)  # HIGH, MEDIUM, LOW
    reason = Column(Text, nullable=False)
    status = Column(String(32), default="RECOMMENDED", nullable=False)  # RECOMMENDED, APPROVED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incident = relationship("Incident", back_populates="actions")
