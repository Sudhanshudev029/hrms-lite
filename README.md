# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v6 |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |

## Features

- **Employee Management** — Add, view, and delete employee records
- **Attendance Tracking** — Mark daily attendance (Present / Absent) per employee
- **Dashboard** — Live summary of today's attendance with stats
- **Filters** — Filter attendance by employee, status, and date range
- **Validations** — Duplicate ID/email checks, required field validation, proper HTTP status codes

## Project Structure

```
ethara/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # DB connection and session
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── employees.py
│   │       ├── attendance.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API layer
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── pages/           # Page components
│   ├── .env.example
│   └── package.json
└── README.md
```

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (running locally or via Docker)

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE hrms_lite;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create a new employee |
| GET | `/api/employees/{id}` | Get employee by ID |
| DELETE | `/api/employees/{id}` | Delete an employee |
| GET | `/api/attendance` | List attendance records (with filters) |
| POST | `/api/attendance` | Mark / update attendance |
| GET | `/api/dashboard` | Get dashboard summary stats |

## Assumptions & Limitations

- Single admin user — no authentication is implemented
- Attendance for the same employee on the same date is upserted (not duplicated)
- Leave management, payroll, and advanced HR features are out of scope
- Date input is capped at today to prevent future-date attendance
