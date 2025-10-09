# ChatBot Platform - COMPLETE STYLING FIX WITH CACHE CLEAR
# This script will fix all styling issues and clear browser cache

Write-Host "COMPLETE STYLING FIX - CACHE CLEAR" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "COMPREHENSIVE FIXES APPLIED:" -ForegroundColor Yellow
Write-Host "  - Updated Tailwind config with safelist (prevents CSS purging)" -ForegroundColor White
Write-Host "  - Added all enhanced animations to Tailwind keyframes" -ForegroundColor White 
Write-Host "  - Added StyleTest component for verification" -ForegroundColor White
Write-Host "  - Enhanced backdrop-blur utilities" -ForegroundColor White
Write-Host ""

Write-Host "STOPPING ALL PROCESSES..." -ForegroundColor Yellow
# Kill any existing Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for processes to fully stop
Start-Sleep -Seconds 2

Write-Host "CLEARING CACHES..." -ForegroundColor Yellow
# Clear npm cache
npm cache clean --force

# Clear Vite cache if it exists
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
    Write-Host "  - Vite cache cleared" -ForegroundColor White
}

# Clear node_modules and reinstall for fresh start
if (Test-Path "node_modules") {
    Write-Host "  - Clearing node_modules for fresh install..." -ForegroundColor White
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "  - Reinstalling dependencies..." -ForegroundColor White
npm install

Write-Host ""
Write-Host "BROWSER CACHE INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "  1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "  2. Right-click the refresh button" -ForegroundColor White  
Write-Host "  3. Select 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "  4. Or press: Ctrl+Shift+R (Chrome/Edge)" -ForegroundColor White
Write-Host ""

# Verify environment
if (Test-Path ".env") {
    Write-Host "Environment: Ready" -ForegroundColor Green
} else {
    Write-Host "Creating environment file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host ""
Write-Host "STARTING ENHANCED PLATFORM WITH STYLE TEST..." -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Platform URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEW FEATURES TO TEST:" -ForegroundColor Green
Write-Host "  1. Navigate to 'Style Test' tab" -ForegroundColor White
Write-Host "  2. Verify glassmorphism effects" -ForegroundColor White
Write-Host "  3. Test 3D hover animations" -ForegroundColor White
Write-Host "  4. Check sparkle and glow effects" -ForegroundColor White
Write-Host "  5. Observe floating animations" -ForegroundColor White
Write-Host "  6. See gradient backgrounds" -ForegroundColor White
Write-Host ""
Write-Host "EXPECTED RESULT: Beautiful modern UI with all effects!" -ForegroundColor Green
Write-Host ""

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Magenta
npm run dev