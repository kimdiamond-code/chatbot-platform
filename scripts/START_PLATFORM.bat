@echo off
echo 🚀 Starting ChatBot Platform...
echo ================================

echo.
echo 📦 Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing main dependencies...
    call npm install
)

if not exist "cors-proxy\node_modules" (
    echo Installing CORS proxy dependencies...
    cd cors-proxy
    call npm install
    cd ..
)

echo.
echo ✅ Starting both servers...
echo 📊 Main app will be at: http://localhost:3000
echo 🌐 CORS proxy will be at: http://localhost:3001
echo.

start "CORS Proxy" cmd /c "cd cors-proxy && npm run dev"
timeout /t 2 /nobreak > nul
start "Main App" cmd /c "npm run dev"

echo.
echo 🎯 Both servers are starting!
echo 📖 Check the terminal windows that opened
echo 🌍 Open http://localhost:3000 in your browser
echo.
pause