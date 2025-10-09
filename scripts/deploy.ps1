# PowerShell Deployment Script for ChatBot Platform
# Usage: .\deploy.ps1 [staging|production|prod]

Write-Host "🤖 ChatBot Platform Deployment" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

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
        exit 1
    }
    Write-Host "✅ Node.js version check passed: $(node -v)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
}
catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy based on argument
$deployType = $args[0]
switch ($deployType) {
    "staging" {
        Write-Host "🚀 Deploying to staging..." -ForegroundColor Magenta
        vercel
    }
    { $_ -in "production", "prod" } {
        Write-Host "🚀 Deploying to production..." -ForegroundColor Magenta
        vercel --prod
    }
    default {
        Write-Host "🚀 Deploying to preview..." -ForegroundColor Magenta
        vercel
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your ChatBot Platform is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open the deployment URL" -ForegroundColor White
    Write-Host "2. Navigate to 'Bot Builder' to configure your chatbot" -ForegroundColor White
    Write-Host "3. Test your bot using the test chat feature" -ForegroundColor White
    Write-Host "4. Deploy the widget to your website" -ForegroundColor White
}
else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}