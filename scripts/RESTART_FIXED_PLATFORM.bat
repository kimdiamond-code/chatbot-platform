@echo off
echo 🔧 Fixing Dashboard Issues & Restarting Platform...
echo.

cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo ✅ ISSUES FIXED:
echo    📊 Removed old Dashboard component conflicts
echo    📈 Fixed chart NaN warnings
echo    🔄 Clearing development cache...
echo.

echo 🧹 Cleaning up development cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo.
echo 🚀 Restarting development server...
echo 🌐 Platform will open at: http://localhost:5173
echo.
echo 📊 Your Enhanced Dashboard should now work perfectly!
echo.

start "ChatBot Platform - Fixed" cmd /k "npm run dev"

timeout /t 2 > nul
start http://localhost:5173

echo ✅ Platform restarting with fixes applied!
echo 💡 Tip: Hard refresh your browser (Ctrl+Shift+R) if you see old data
echo.
pause
