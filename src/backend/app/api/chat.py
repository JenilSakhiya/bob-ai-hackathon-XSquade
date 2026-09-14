from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident, IncidentEvent
from app.models.event import SecurityEvent
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessageResponse
from app.ai import get_ai_provider

router = APIRouter(prefix="/incidents", tags=["chat"])


@router.post("/{incident_id}/chat", response_model=ChatResponse)
def chat_with_incident(
    incident_id: str,
    chat_req: ChatRequest,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    user_msg_text = chat_req.message.strip()
    if not user_msg_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty.")

    # Save user message
    user_msg = ChatMessage(
        incident_id=incident.id,
        role="user",
        content=user_msg_text,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()

    # Retrieve related events
    events = (
        db.query(SecurityEvent)
        .join(IncidentEvent, IncidentEvent.event_id == SecurityEvent.id)
        .filter(IncidentEvent.incident_id == incident.id)
        .order_by(SecurityEvent.timestamp.asc())
        .all()
    )

    # Retrieve recent chat history for context
    history_orm = (
        db.query(ChatMessage)
        .filter(ChatMessage.incident_id == incident.id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    history_formatted = [{"role": m.role, "content": m.content} for m in history_orm]

    # Call AI Provider
    ai_provider = get_ai_provider()
    reply_text = ai_provider.answer_question(
        incident=incident,
        events=events,
        question=user_msg_text,
        chat_history=history_formatted
    )

    # Save assistant message
    asst_msg = ChatMessage(
        incident_id=incident.id,
        role="assistant",
        content=reply_text,
        timestamp=datetime.utcnow()
    )
    db.add(asst_msg)
    db.commit()

    # Re-fetch full history
    updated_history = (
        db.query(ChatMessage)
        .filter(ChatMessage.incident_id == incident.id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )

    return ChatResponse(
        incident_id=incident.id,
        reply=reply_text,
        history=[ChatMessageResponse.model_validate(m) for m in updated_history]
    )


@router.get("/{incident_id}/chat", response_model=List[ChatMessageResponse])
def get_chat_history(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found.")

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.incident_id == incident.id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    return [ChatMessageResponse.model_validate(m) for m in history]
