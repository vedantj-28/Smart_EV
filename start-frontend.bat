@echo off
echo 🚀 Starting EV Charging Frontend...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ package.json not found in current directory
    echo Please navigate to the frontend project directory first
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm.cmd install
)

REM Start the development server
echo 🎯 Starting React development server...
echo 📡 Frontend will be available at http://localhost:3000
echo 📡 Press Ctrl+C to stop the server
echo.
npm.cmd run dev

pause
