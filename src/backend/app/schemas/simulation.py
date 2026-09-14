from typing import List, Optional
from pydantic import BaseModel
from app.schemas.event import SecurityEventResponse
from app.schemas.incident import IncidentDetailResponse


class SimulationStep(BaseModel):
    time_offset: str
    event_type: str
    description: str
    status: str = "EMITTED"


class SimulationResult(BaseModel):
    simulation_name: str
    incident_id: Optional[str] = None
    events_generated: int
    incident: Optional[IncidentDetailResponse] = None
    steps: List[SimulationStep]
    message: str
