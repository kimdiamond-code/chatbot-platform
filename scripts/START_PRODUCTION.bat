@echo off
echo 🚀 Starting Production-Ready ChatBot Platform...
echo ================================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo ✅ Checking environment...
if not exist ".env" (
    echo ❌ .env file not found! Creating from example...
    copy ".env.example" ".env"
    echo ⚠️  Please update .env with your API keys
    pause
    exit /b 1
)

echo ✅ Installing dependencies...
call npm install

echo.
echo ✅ Starting development server...
echo 🌐 Open browser to: http://localhost:5173
echo ⭐ Enhanced UI with 3D effects will load
echo 📊 Dashboard shows real-time demo data
echo 🔧 System test available in navigation
echo.
echo Press Ctrl+C to stop server
echo.

call npm run dev

pause
