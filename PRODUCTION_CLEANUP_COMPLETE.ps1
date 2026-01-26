# ============================================================================
# PRODUCTION CLEANUP - COMPLETE
# Removes all test files, console logs, and prepares for production deployment
# ============================================================================

Write-Host "🧹 Starting Production Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# ============================================================================
# STEP 1: Remove Test Components and Files
# ============================================================================
Write-Host "📦 Step 1: Removing test files and components..." -ForegroundColor Yellow

$testFiles = @(
    "src\components\BotBuilderSaveTest.jsx",
    "src\pages\ShopifyTestPage.jsx",
    "src\components\ShopifyTest.jsx",
    "src\components\SmartBotTest.jsx",
    "src\components\StyleTest.jsx",
    "src\components\TestComponent.jsx",
    "api\kustomer.js.OLD",
    "api\shopify.js.OLD",
    "api\scrape-discover.js.OLD",
    "api\scrape-page.js.OLD"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removed: $file" -ForegroundColor Green
    }
}

# ============================================================================
# STEP 2: Remove Console Logs from Source Files
# ============================================================================
Write-Host ""
Write-Host "🔇 Step 2: Removing console statements..." -ForegroundColor Yellow

$sourceFiles = Get-ChildItem -Path "src" -Include "*.jsx","*.js" -Recurse -File
$apiFiles = Get-ChildItem -Path "api" -Include "*.js" -Recurse -File -Exclude "node_modules"

$allFiles = $sourceFiles + $apiFiles

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log, console.error, console.warn, console.debug
    $content = $content -replace "console\.(log|error|warn|debug)\([^)]*\);?`n?", ""
    $content = $content -replace "console\.(log|error|warn|debug)\([^)]*\);?`r?`n?", ""
    
    # Clean up multiple blank lines (more than 2 in a row)
    $content = $content -replace "(`r?`n){3,}", "`r`n`r`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✅ Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

# ============================================================================
# STEP 3: Remove Emergency Activator Script
# ============================================================================
Write-Host ""
Write-Host "🔧 Step 3: Removing development utilities..." -ForegroundColor Yellow

if (Test-Path "src\utils\emergencyActivator.js") {
    Remove-Item "src\utils\emergencyActivator.js" -Force
    Write-Host "  ✅ Removed emergency activator" -ForegroundColor Green
}

if (Test-Path "src\utils\debugEnv.js") {
    Remove-Item "src\utils\debugEnv.js" -Force
    Write-Host "  ✅ Removed debug utilities" -ForegroundColor Green
}

# ============================================================================
# STEP 4: Update App.jsx to Remove Test Imports
# ============================================================================
Write-Host ""
Write-Host "📝 Step 4: Cleaning App.jsx imports..." -ForegroundColor Yellow

$appPath = "src\App.jsx"
if (Test-Path $appPath) {
    $appContent = Get-Content $appPath -Raw
    
    # Remove debug imports
    $appContent = $appContent -replace "import.*debugEnv.*`n", ""
    $appContent = $appContent -replace "import.*emergencyActivator.*`n", ""
    $appContent = $appContent -replace "debugEnvVars\(\);?`n?", ""
    
    Set-Content -Path $appPath -Value $appContent -NoNewline
    Write-Host "  ✅ Cleaned App.jsx" -ForegroundColor Green
}

# ============================================================================
# STEP 5: Verify No Hardcoded Organization IDs
# ============================================================================
Write-Host ""
Write-Host "🔍 Step 5: Checking for hardcoded values..." -ForegroundColor Yellow

$hardcodedCheck = Select-String -Path "src\**\*.jsx","src\**\*.js","api\*.js" -Pattern "00000000-0000-0000-0000-000000000001" -ErrorAction SilentlyContinue

if ($hardcodedCheck) {
    Write-Host "  ⚠️  WARNING: Found hardcoded organization IDs!" -ForegroundColor Red
    $hardcodedCheck | ForEach-Object {
        Write-Host "    - $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ No hardcoded organization IDs found" -ForegroundColor Green
}

# ============================================================================
# STEP 6: Clean Up Documentation Files
# ============================================================================
Write-Host ""
Write-Host "📚 Step 6: Organizing documentation..." -ForegroundColor Yellow

# Create docs archive folder if it doesn't exist
if (-not (Test-Path "docs\archive")) {
    New-Item -Path "docs\archive" -ItemType Directory -Force | Out-Null
}

# Move markdown files to docs folder
$markdownFiles = Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" }
foreach ($file in $markdownFiles) {
    Move-Item -Path $file.FullName -Destination "docs\archive\" -Force -ErrorAction SilentlyContinue
}

Write-Host "  ✅ Documentation organized" -ForegroundColor Green

# ============================================================================
# STEP 7: Remove Deployment Scripts
# ============================================================================
Write-Host ""
Write-Host "🗑️  Step 7: Cleaning deployment scripts..." -ForegroundColor Yellow

$deployScripts = Get-ChildItem -Path "." -Filter "DEPLOY_*.bat" -File
foreach ($script in $deployScripts) {
    Remove-Item $script.FullName -Force
    Write-Host "  ✅ Removed: $($script.Name)" -ForegroundColor Green
}

# Also remove old PowerShell scripts
$psScripts = @(
    "deploy.ps1",
    "deploy-fix.ps1",
    "fix-*.ps1",
    "create-*.ps1",
    "cleanup-*.ps1"
)

foreach ($pattern in $psScripts) {
    $files = Get-ChildItem -Path "." -Filter $pattern -File
    foreach ($file in $files) {
        if ($file.Name -ne "PRODUCTION_CLEANUP_COMPLETE.ps1") {
            Remove-Item $file.FullName -Force
            Write-Host "  ✅ Removed: $($file.Name)" -ForegroundColor Green
        }
    }
}

# ============================================================================
# COMPLETION
# ============================================================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "✨ PRODUCTION CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes with: git status" -ForegroundColor White
Write-Host "  2. Test locally: npm run dev" -ForegroundColor White
Write-Host "  3. Commit: git add . && git commit -m 'Production cleanup'" -ForegroundColor White
Write-Host "  4. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""

# Keep window open
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
