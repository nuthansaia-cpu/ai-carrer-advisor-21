@echo off
title AI Career Advisor
cd /d "%~dp0"
python run.py
if %errorlevel% neq 0 (
    echo.
    echo An error occurred while running the project.
    pause
)
