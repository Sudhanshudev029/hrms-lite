from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date as date_type

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date_type.today()

    total_employees = db.query(models.Employee).count()

    present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.AttendanceStatus.PRESENT,
    ).count()

    absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.AttendanceStatus.ABSENT,
    ).count()

    marked_today = present_today + absent_today
    not_marked_today = max(0, total_employees - marked_today)

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "not_marked_today": not_marked_today,
    }
