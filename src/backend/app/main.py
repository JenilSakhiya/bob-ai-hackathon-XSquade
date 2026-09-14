from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import Base, engine, SessionLocal
import app.models  # Ensure all models are registered
from app.api import (
    dashboard_router,
    events_router,
    incidents_router,
    investigations_router,
    reports_router,
    chat_router,
    simulation_router
)
from app.seed.seed_data import seed_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cybersentinel")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed baseline telemetry
    logger.info("Initializing CyberSentinel database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        logger.info("Checking demo seed data...")
        seed_database(db, force=False)
    finally:
        db.close()
        
    logger.info("CyberSentinel AI SOC Analyst backend ready.")
    yield
    logger.info("CyberSentinel backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Security Operations Center (SOC) Assistant for Event Correlation, Threat Investigation, and Risk Scoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler to prevent stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred in CyberSentinel SOC engine."}
    )

# Health & Root Check
@app.get("/")
def root_status():
    return {
        "service": "CyberSentinel AI SOC Analyst",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "ai_status": "READY"
    }


@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "system": "OPERATIONAL",
        "ai_engine": "READY",
        "database": "CONNECTED"
    }


# Include Routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(investigations_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
