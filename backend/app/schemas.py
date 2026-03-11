from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional

from app.models import AttendanceStatus


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus


class AttendanceResponse(BaseModel):
    id: int
    employee: EmployeeResponse
    date: date
    status: AttendanceStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_today: int
