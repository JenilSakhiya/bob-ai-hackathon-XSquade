# CyberSentinel — Setup & Running Guide

## Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

---

## 1. Backend Setup

```powershell
# Navigate to backend folder
cd d:\project\IBM\src\backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate virtual environment (Linux / macOS)
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests to verify installation
pytest -v

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **Note**: On initial startup, CyberSentinel automatically initializes the SQLite schema (`cybersentinel.db`) and seeds 170+ baseline security events and historical incidents.

API Documentation is available at:
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 2. Frontend Setup

In a separate terminal:

```powershell
# Navigate to frontend folder
cd d:\project\IBM\src\frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

Open your browser and navigate to:
- **Command Center UI**: [http://localhost:5173](http://localhost:5173)

---

## 3. Docker Compose Setup (Optional)

To run the entire application containerized:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
