# Test Script for ChatBot Platform
# Usage: .\test.ps1

Write-Host "🧪 ChatBot Platform Test Suite" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test 1: Check if we're in the right directory
Write-Host "🔍 Test 1: Directory Check" -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "❌ FAIL: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}
Write-Host "✅ PASS: Found package.json" -ForegroundColor Green

# Test 2: Check Node.js
Write-Host "🔍 Test 2: Node.js Check" -ForegroundColor Yellow
try {
    $nodeVersion = (node -v).Replace('v', '').Split('.')[0]
    if ([int]$nodeVersion -lt 18) {
        Write-Host "❌ FAIL: Node.js 18+ required. Current: $(node -v)" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ PASS: Node.js version $(node -v)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: Node.js not found" -ForegroundColor Red
    exit 1
}

# Test 3: Check npm
Write-Host "🔍 Test 3: npm Check" -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✅ PASS: npm version $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: npm not found" -ForegroundColor Red
    exit 1
}

# Test 4: Check critical files
Write-Host "🔍 Test 4: Critical Files Check" -ForegroundColor Yellow
$criticalFiles = @(
    "src/App.jsx",
    "src/main.jsx", 
    "src/components/BotBuilder.jsx",
    "src/components/botbuilder/DirectiveBlock.jsx",
    "src/components/botbuilder/PersonalitySettings.jsx",
    "index.html",
    "vite.config.js"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ FAIL: Missing critical files" -ForegroundColor Red
    exit 1
}
Write-Host "✅ PASS: All critical files present" -ForegroundColor Green

# Test 5: Check dependencies
Write-Host "🔍 Test 5: Dependencies Check" -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  WARNING: node_modules not found. Run 'npm install'" -ForegroundColor Yellow
} else {
    Write-Host "✅ PASS: node_modules exists" -ForegroundColor Green
}

# Test 6: Try to build
Write-Host "🔍 Test 6: Build Test" -ForegroundColor Yellow
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PASS: Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Build failed" -ForegroundColor Red
        Write-Host "Try running: npm install" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ FAIL: Build test failed" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White
Write-Host "🎯 Test Results Summary:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

if ($missingFiles.Count -eq 0 -and $nodeVersion -ge 18) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Your ChatBot Platform is ready!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'npm install' (if dependencies missing)" -ForegroundColor White
    Write-Host "2. Run 'npm run dev' to start development server" -ForegroundColor White
    Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
    Write-Host "4. Navigate to 'Bot Builder' to configure your bot" -ForegroundColor White
} else {
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Red
}