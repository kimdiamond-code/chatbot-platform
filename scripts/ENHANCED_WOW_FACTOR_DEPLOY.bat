@echo off
echo.
echo ========================================
echo    ENHANCED WOW FACTOR UPDATE DEPLOYED!
echo ========================================
echo.
echo Deploying enhanced modern UI with 3D effects...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this from the chatbot-platform directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Found package.json - In correct directory
echo.

REM Stop any running development server
echo 🛑 Stopping any running servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧹 Cleaning node modules and cache...
if exist "node_modules" rmdir /s /q "node_modules"
if exist ".next" rmdir /s /q ".next"
if exist "dist" rmdir /s /q "dist"

echo.
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo.
    echo ❌ ERROR: npm install failed
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

echo 🚀 Starting enhanced development server...
echo.
echo ========================================
echo   🎨 ENHANCED UI FEATURES ACTIVE:
echo ========================================
echo ✨ 3D hover effects and tilting cards
echo 🌟 Floating particle animations  
echo 🎭 Morphing buttons with ripple effects
echo 🌈 Dynamic color-following backgrounds
echo 💫 Advanced glassmorphism effects
echo ⚡ Micro-interactions and visual feedback
echo 🔮 Smart hover states with glows
echo 🎪 Performance-optimized animations
echo.
echo ========================================
echo   📍 TEST THESE FEATURES:
echo ========================================
echo 1. Hover over navigation items → 3D tilt
echo 2. Watch sidebar → Floating particles
echo 3. Move cursor around → Color following
echo 4. Click buttons → Ripple animations
echo 5. Hover cards → Lift and glow effects
echo.
echo Platform will open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================

REM Start the development server
start "" "http://localhost:5173"
call npm run dev

pause