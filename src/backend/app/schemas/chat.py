from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    id: int
    incident_id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    incident_id: str
    reply: str
    history: List[ChatMessageResponse]
