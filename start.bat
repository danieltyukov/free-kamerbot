@echo off
echo Starting FreeKamerBot...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm run install-all
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo .env file created. Please edit it with your credentials.
)

REM Create data directory
if not exist "data" mkdir data

REM Start the application
echo Launching FreeKamerBot...
echo Dashboard will open at: http://localhost:3000
echo API server at: http://localhost:3001
echo.
echo Press Ctrl+C to stop
echo.

npm start
