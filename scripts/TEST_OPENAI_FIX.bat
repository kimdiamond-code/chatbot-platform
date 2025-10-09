@echo off
cls
echo ===============================================
echo   🔧 OPENAI CLIENT FIX - TESTING SCRIPT
echo ===============================================
echo.
echo 🎯 This script will verify the OpenAI async import bug fix
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ ERROR: package.json not found
    echo    Please run this from the chatbot-platform directory
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json - in correct directory
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️  node_modules not found - installing dependencies...
    npm install
    echo.
)

:: Check for OpenAI package specifically
npm list openai >nul 2>&1
if errorlevel 1 (
    echo ❌ OpenAI package not found - installing...
    npm install openai
    echo.
)

echo ✅ Dependencies verified
echo.

:: Check .env file
if not exist ".env" (
    echo ❌ ERROR: .env file not found
    echo    Please create .env file with your OpenAI API key
    echo    Expected format: VITE_OPENAI_API_KEY=sk-proj-...
    echo.
    pause
    exit /b 1
)

:: Check for OpenAI key in .env
findstr "VITE_OPENAI_API_KEY" .env >nul
if errorlevel 1 (
    echo ❌ ERROR: VITE_OPENAI_API_KEY not found in .env file
    echo    Please add your OpenAI API key to .env file
    echo.
    pause
    exit /b 1
)

echo ✅ Environment configuration verified
echo.

echo 🚀 Starting development server...
echo.
echo 📋 TESTING INSTRUCTIONS:
echo    1. Wait for server to start
echo    2. Open browser to http://localhost:5173
echo    3. Open browser console (F12)
echo    4. Run: diagnoseOpenAI()
echo    5. Check for "success: true" in all steps
echo.
echo 🎯 EXPECTED RESULTS:
echo    - "✅ OpenAI client initialized successfully"
echo    - No more "🎮 Demo Mode" messages
echo    - Real AI responses in chat tests
echo.
echo Press Ctrl+C to stop server when done testing
echo.

npm run dev