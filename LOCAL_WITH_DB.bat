@echo off
echo ========================================
echo  LOCAL DEV WITH DATABASE (Vercel CLI)
echo ========================================
echo.

echo This will run the API endpoints locally
echo using Vercel CLI instead of Vite.
echo.

echo [1/3] Checking if Vercel CLI is installed...
call vercel --version >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not installed!
    echo.
    echo Installing Vercel CLI globally...
    call npm install -g vercel
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Vercel CLI
        echo.
        echo Please install manually:
        echo npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI installed
echo.

echo [2/3] Setting up Vercel project...
echo (This may ask you to login to Vercel)
echo.

call vercel link

echo.
echo [3/3] Starting local dev server with API support...
echo.
echo ========================================
echo  SERVER STARTING
echo ========================================
echo.
echo Local URL: http://localhost:3000
echo API Endpoint: http://localhost:3000/api/consolidated
echo.
echo Database will be ONLINE locally!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call vercel dev

pause
