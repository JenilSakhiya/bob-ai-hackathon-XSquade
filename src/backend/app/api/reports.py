from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.report_service import ReportService
from app.schemas.investigation import IncidentReportResponse

router = APIRouter(prefix="/incidents", tags=["reports"])


@router.post("/{incident_id}/report", response_model=IncidentReportResponse)
def generate_incident_report(incident_id: str, db: Session = Depends(get_db)):
    try:
        report = ReportService.generate_incident_report(db, incident_id)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate report: {str(e)}")
