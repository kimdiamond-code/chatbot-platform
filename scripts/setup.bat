@echo off
echo 🤖 ChatBot Platform Setup
echo =========================

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo 🔨 Testing build...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully

echo 🚀 Starting development server...
echo Opening http://localhost:5173 in your browser...

start http://localhost:5173
npm run dev

pause