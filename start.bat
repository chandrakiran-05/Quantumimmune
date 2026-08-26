@echo off
echo ==============================================================================
echo                      QuantumImmune Dx Diagnostic System
echo ==============================================================================
echo Starting FastAPI Backend (Port 8000)...
start cmd /k "title FastAPI Backend && cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo Starting Next.js Frontend (Port 3000)...
start cmd /k "title Next.js Frontend && cd frontend && npx next dev -p 3000"

echo.
echo ==============================================================================
echo Sub-systems launched successfully!
echo   - Backend Service: http://localhost:8000
echo   - Frontend Dashboard: http://localhost:3000
echo ==============================================================================
echo Press any key in the spawned command prompts to stop individual services.
pause
