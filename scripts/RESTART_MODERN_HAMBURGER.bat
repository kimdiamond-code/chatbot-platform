@echo off
echo ✨ RESTARTING MODERN HAMBURGER MENU PLATFORM ✨
echo.
echo 🔧 Stopping any running servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting the enhanced platform...
echo.
echo ✅ Modern hamburger menu is now ready!
echo ✅ Enhanced animations and interactions
echo ✅ Mobile-optimized responsive design
echo ✅ Professional glassmorphism styling
echo.

cd /d "%~dp0"
npm run dev

pause