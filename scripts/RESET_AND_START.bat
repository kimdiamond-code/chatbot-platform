@echo off
echo 🔄 COMPLETE CHATBOT PLATFORM RESET
echo =====================================
echo.

echo ⏹️ Step 1: Stopping any running Node processes...
taskkill /f /im node.exe >nul 2>&1

echo 🧹 Step 2: Clearing all caches and build files...
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
if exist .vite rmdir /s /q .vite
npm cache clean --force >nul 2>&1

echo 📦 Step 3: Fresh install of dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ ERROR: npm install failed
    echo Try running: npm cache clean --force
    pause
    exit /b 1
)

echo ✅ Step 4: Dependencies installed successfully

echo 🚀 Step 5: Starting development server...
echo.
echo 🌐 Your platform will be available at:
echo   Local:   http://localhost:5173
echo   Network: http://192.168.1.151:5173
echo.
echo 📋 What to look for:
echo   ✅ Green "CHATBOT PLATFORM LOADED!" message
echo   ✅ Click "Test Status" in sidebar first
echo   ✅ Then try "Bot Builder" 
echo.
echo 🆘 If you see errors, press Ctrl+C and run this script again
echo.

start "ChatBot Platform" http://localhost:5173
npm run dev

pause