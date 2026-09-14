from app.api.dashboard import router as dashboard_router
from app.api.events import router as events_router
from app.api.incidents import router as incidents_router
from app.api.investigations import router as investigations_router
from app.api.reports import router as reports_router
from app.api.chat import router as chat_router
from app.api.simulation import router as simulation_router

__all__ = [
    "dashboard_router",
    "events_router",
    "incidents_router",
    "investigations_router",
    "reports_router",
    "chat_router",
    "simulation_router",
]
