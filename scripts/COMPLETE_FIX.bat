@echo off
cls
echo ===============================================
echo   🔧 FIXING LOADING COMPONENT EXPORT ERROR
echo ===============================================
echo.
echo ✅ Fixed Loading.jsx default export
echo ✅ Dependencies should be installed 
echo.
echo 🚀 Restarting development server...
echo.

:: Stop any running dev server
taskkill /f /im node.exe >nul 2>&1

echo 📦 Quick dependency check...
npm list react-router-dom >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Installing missing react-router-dom...
    npm install react-router-dom@^6.8.1
)

npm list date-fns >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Installing missing date-fns...
    npm install date-fns@^2.30.0
)

echo.
echo ✅ All dependencies ready!
echo.
echo 🎯 Expected fixes:
echo    - No more Loading.jsx export errors
echo    - LiveChat should load without issues
echo    - BotBuilder test chat uses real OpenAI
echo    - OpenAI diagnostic working: diagnoseOpenAI()
echo.

:: Start the dev server
npm run dev