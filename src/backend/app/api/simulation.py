from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.simulation_service import SimulationService
from app.schemas.simulation import SimulationResult
from app.seed.seed_data import seed_database

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/full-attack", response_model=SimulationResult)
def simulate_full_attack(db: Session = Depends(get_db)):
    """
    Executes primary demo scenario:
    Possible Account Takeover + Privilege Escalation + Data Exfiltration (CRITICAL, Risk 90-100).
    """
    try:
        result = SimulationService.run_full_attack(db, target_user="admin01", target_asset="workstation-42")
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Simulation failed: {str(e)}")


@router.post("/brute-force", response_model=SimulationResult)
def simulate_brute_force(db: Session = Depends(get_db)):
    try:
        result = SimulationService.run_brute_force(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Simulation failed: {str(e)}")


@router.post("/account-takeover", response_model=SimulationResult)
def simulate_account_takeover(db: Session = Depends(get_db)):
    try:
        result = SimulationService.run_account_takeover(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Simulation failed: {str(e)}")


@router.post("/data-exfiltration", response_model=SimulationResult)
def simulate_data_exfiltration(db: Session = Depends(get_db)):
    try:
        result = SimulationService.run_data_exfiltration(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Simulation failed: {str(e)}")


@router.post("/reset")
def reset_simulation_data(db: Session = Depends(get_db)):
    """
    Clears current telemetry and resets database with clean baseline seed data.
    """
    try:
        seed_database(db, force=True)
        return {"status": "success", "message": "Telemetry database successfully reset to clean demo state."}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Reset failed: {str(e)}")
