from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.AttendanceResponse)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    existing = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == attendance.employee_id,
            models.Attendance.date == attendance.date,
        )
    ).first()

    if existing:
        existing.status = attendance.status
        db.commit()
        record_id = existing.id
    else:
        db_attendance = models.Attendance(**attendance.model_dump())
        db.add(db_attendance)
        db.commit()
        record_id = db_attendance.id

    return (
        db.query(models.Attendance)
        .options(joinedload(models.Attendance.employee))
        .filter(models.Attendance.id == record_id)
        .first()
    )


@router.get("/", response_model=List[schemas.AttendanceResponse])
def list_attendance(
    employee_id: Optional[int] = Query(None),
    date: Optional[date] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance).options(joinedload(models.Attendance.employee))

    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date:
        query = query.filter(models.Attendance.date == date)
    if start_date:
        query = query.filter(models.Attendance.date >= start_date)
    if end_date:
        query = query.filter(models.Attendance.date <= end_date)
    if status:
        query = query.filter(models.Attendance.status == status)

    return query.order_by(models.Attendance.date.desc()).all()
