@echo off
title Start GameCraft AI Scribe Servers - Minimal Test

REM Get the directory where this batch script is located
set SCRIPT_DIR=%~dp0
echo Script Directory: %SCRIPT_DIR%

REM --- Check ONLY for backend\.env using DIR and ERRORLEVEL ---
echo Checking prerequisite: backend\.env ...

dir /b "%SCRIPT_DIR%backend\.env" > nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: backend\.env file not found! Please create it.
    pause
    exit /b 1
)

echo OK: backend\.env check passed.
REM Check for backend venv activate script
dir /b "%SCRIPT_DIR%backend\venv\Scripts\activate.bat" > nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
echo WARNING: Activate script not found. Trying without venv.
)
REM Check for node_modules folder
dir /b "%SCRIPT_DIR%node_modules" > nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
echo WARNING: node_modules folder not found. Run 'npm install'.
pause
)
echo Checks complete.
echo.

REM --- Start Backend Server ---
echo Starting Flask Backend Server in a new window...
REM Use standard 'if exist' here as it's simpler for choosing which command to run
if exist "%SCRIPT_DIR%backend\venv\Scripts\activate.bat" (
    REM Start with virtual environment activated
    start "Backend Server (Flask)" cmd /k "cd /d "%SCRIPT_DIR%backend" && echo Activating virtual environment... && call .\venv\Scripts\activate.bat && echo Starting Flask app... && python app.py"
) else (
    REM Start without virtual environment (might fail if dependencies aren't global)
    start "Backend Server (Flask - NO VENV)" cmd /k "cd /d "%SCRIPT_DIR%backend" && echo Starting Flask app (without venv)... && python app.py"
)
echo Backend server process started. Check the new window titled 'Backend Server'.
echo Waiting a few seconds for backend to initialize...
timeout /t 5 /nobreak > nul
echo.

REM --- Start Frontend Server ---
echo Starting React Frontend Server (Vite) in a new window...
start "Frontend Server (Vite)" cmd /k "cd /d "%SCRIPT_DIR%" && echo Starting Vite dev server... && npm run dev"
echo Frontend server process started. Check the new window titled 'Frontend Server'.
echo.

echo ==========================================================
echo Both servers should now be starting in separate windows.
echo Once the frontend server (Vite) shows a URL (like http://localhost:5173/),
echo open that URL in your web browser to access the application.
echo ==========================================================
echo.
echo You can close this window when you no longer need this message.
echo The server windows must remain open to keep the app running.
pause