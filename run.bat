@echo off
echo ========================================================
echo Starting ColdCraft AI (Backend FastAPI + Frontend Vite)
echo ========================================================

start "ColdCraft Backend API" cmd /k "python backend/app.py"
start "ColdCraft Frontend Web UI" cmd /k "npx vite --host 127.0.0.1 --port 5173"

echo.
echo Application is starting!
echo Web UI Dashboard: http://127.0.0.1:5173
echo Backend API:      http://127.0.0.1:8000
echo ========================================================
