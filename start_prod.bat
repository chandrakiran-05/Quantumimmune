@echo off
echo ==============================================================================
echo                 QuantumImmune Dx — PRODUCTION DEPLOYMENT
echo ==============================================================================

echo [1/3] Verifying and installing backend dependencies...
cd backend
python -m pip install -r ../requirements.txt -q
cd ..

echo [2/3] Building Next.js Frontend for Production...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo ==============================================================================
echo                 Starting Production Services
echo ==============================================================================

echo Starting FastAPI Backend (Port 8000) with 4 Workers...
start cmd /k "title FastAPI Backend (PROD) && cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4"

echo Starting Next.js Frontend (Port 3000) in Production Mode...
start cmd /k "title Next.js Frontend (PROD) && cd frontend && npm run start"

echo.
echo ==============================================================================
echo Production systems launched successfully!
echo   - Backend API: http://localhost:8000
echo   - Frontend UI: http://localhost:3000
echo ==============================================================================
echo Close the spawned terminal windows to stop the services.
pause
