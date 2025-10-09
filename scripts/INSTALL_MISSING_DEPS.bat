@echo off
cls
echo ===============================================
echo   🔧 INSTALLING MISSING DEPENDENCIES
echo ===============================================
echo.
echo ⚠️  Missing dependencies detected:
echo    - react-router-dom (for routing)
echo    - date-fns (for date formatting)
echo.
echo 📦 Installing required packages...
echo.

:: Stop any running dev server
taskkill /f /im node.exe >nul 2>&1

:: Install missing dependencies
npm install react-router-dom@^6.8.1 date-fns@^2.30.0

if errorlevel 1 (
    echo ❌ Installation failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Starting development server...
echo.

:: Start the dev server
npm run dev