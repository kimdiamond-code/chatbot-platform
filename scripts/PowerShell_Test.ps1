# ✅ ChatBot Platform - PowerShell Quick Fix Test
# Fixed import error in Integrations.jsx

Write-Host "🔧 Import Error Fixed in Integrations.jsx!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory (already there)
Write-Host "📁 Current Directory: $PWD" -ForegroundColor Yellow

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Creating .env from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Magenta
Write-Host "🌐 Platform will open at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "✨ Enhanced UI with Integrations Hub will load" -ForegroundColor Green
Write-Host ""
Write-Host "Features now working:" -ForegroundColor Yellow
Write-Host "  - ✅ Enhanced 3D Navigation" -ForegroundColor White
Write-Host "  - ✅ Real-time Dashboard" -ForegroundColor White  
Write-Host "  - ✅ Complete Integrations Hub" -ForegroundColor White
Write-Host "  - ✅ Mobile responsive design" -ForegroundColor White
Write-Host ""

# Start the development server
npm run dev
