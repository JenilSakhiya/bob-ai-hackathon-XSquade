from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.investigation_service import InvestigationService
from app.schemas.investigation import InvestigationResult

router = APIRouter(prefix="/incidents", tags=["investigations"])


@router.post("/{incident_id}/investigate", response_model=InvestigationResult)
def trigger_investigation(incident_id: str, db: Session = Depends(get_db)):
    try:
        result = InvestigationService.run_investigation(db, incident_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Investigation failed: {str(e)}")
