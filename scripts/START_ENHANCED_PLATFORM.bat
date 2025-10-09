@echo off
echo 🚀 Starting ChatBot Platform with Enhanced Dashboard...
echo.

cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo 📦 Installing any missing dependencies...
npm install --silent

echo.
echo ✨ NEW FEATURES ADDED:
echo    📊 Real-time Analytics Dashboard
echo    📈 Professional Charts & Visualizations  
echo    🔄 Auto-refresh Capability
echo    📱 Mobile-Responsive Navigation
echo.
echo 🌐 Platform will open at: http://localhost:5173
echo 📋 Check the Dashboard tab to see the new analytics!
echo.
echo 🎯 What to Test:
echo    • Dashboard - Real-time metrics with charts
echo    • Mobile view - Hamburger menu navigation  
echo    • Live Chat - Conversation management
echo    • Bot Builder - All 6 tabs functional
echo.

start "ChatBot Platform" cmd /k "npm run dev"

timeout /t 3 > nul
start http://localhost:5173

echo ✅ Platform starting... Check your browser!
echo.
pause
