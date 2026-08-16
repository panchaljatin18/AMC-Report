@echo off
echo ===================================================
echo   Starting CCRS CRM (FastAPI + Next.js)
echo ===================================================

echo [1/2] Starting Backend FastAPI on port 8000...
start "CCRS CRM Backend" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend Next.js on port 3000...
cd frontend
npm run dev
