@echo off
echo 🔧 EMERGENCY SERVER RESTART - Simple Method
echo.

echo Current directory:
cd

echo.
echo 🛑 Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🚀 Starting development server...
echo Look for: "Local: http://localhost:5173/"
echo.

npm run dev

echo.
echo ❌ If you see errors above, try:
echo 1. Ctrl+C to stop
echo 2. npm install
echo 3. npm run dev again
echo.
pause