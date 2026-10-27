@echo off
REM SmartJobs launcher for Windows: double-click this file.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed. Download the LTS version from https://nodejs.org
  echo  install it, then double-click this file again.
  echo.
  pause
  exit /b 1
)
echo Starting SmartJobs on http://localhost:3000  (close this window to stop)
start "" "http://localhost:3000"
node backend\server.js
pause
