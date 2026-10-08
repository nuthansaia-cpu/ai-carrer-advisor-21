@echo off
echo ============================================
echo   AI Career Advisor - React Frontend
echo   Node.js Required
echo ============================================
echo.
cd /d "%~dp0frontend"
echo Installing dependencies...
npm install
echo.
echo Starting React dev server on http://localhost:3000
echo Backend must be running on http://localhost:8000
echo.
npm start
