# PowerShell Setup Script for ChatBot Platform
# Usage: .\setup.ps1 [-Development] [-Production]

param(
    [switch]$Development,
    [switch]$Production
)

Write-Host "🤖 ChatBot Platform Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check Node.js version
try {
    $nodeVersion = (node -v).Replace('v', '').Split('.')[0]
    if ([int]$nodeVersion -lt 18) {
        Write-Host "❌ Error: Node.js 18+ required. Current version: $(node -v)" -ForegroundColor Red
        Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Node.js version check passed: $(node -v)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: npm not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
    Write-Host "Try running: npm cache clean --force" -ForegroundColor Yellow
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "💡 Remember to update .env with your actual configuration" -ForegroundColor Cyan
}

# Build the project to test
Write-Host "🔨 Testing build process..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    exit 1
}

# Setup completion message
Write-Host "" -ForegroundColor White
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "" -ForegroundColor White

if ($Development) {
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "Opening http://localhost:5173 in your browser..." -ForegroundColor Yellow
    
    # Start the dev server
    Start-Process "http://localhost:5173"
    npm run dev
}
elseif ($Production) {
    Write-Host "📦 Building for production..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "🚀 Ready for production deployment!" -ForegroundColor Green
    Write-Host "Run 'npm run deploy' to deploy to Vercel" -ForegroundColor Yellow
}
else {
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'npm run dev' to start development server" -ForegroundColor White
    Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White
    Write-Host "3. Navigate to 'Bot Builder' to configure your chatbot" -ForegroundColor White
    Write-Host "4. Test your bot using /widget/demo.html" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "For production deployment:" -ForegroundColor Cyan
    Write-Host "Run 'npm run deploy' or '.\scripts\deploy.ps1 production'" -ForegroundColor White
}

Write-Host "" -ForegroundColor White
Write-Host "📋 Available commands:" -ForegroundColor Cyan
Write-Host "npm run dev          # Start development server" -ForegroundColor White
Write-Host "npm run build        # Build for production" -ForegroundColor White
Write-Host "npm run preview      # Preview production build" -ForegroundColor White
Write-Host "npm run deploy       # Deploy to Vercel" -ForegroundColor White
Write-Host "npm run clean        # Clean build cache" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Happy bot building! 🤖✨" -ForegroundColor Green