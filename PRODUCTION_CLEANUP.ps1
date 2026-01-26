# ====================================================================
# PRODUCTION CLEANUP SCRIPT
# Removes all True Citrus references, test files, and prepares for multi-tenant production
# ====================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRODUCTION CLEANUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Remove True Citrus specific service file
Write-Host "[1/6] Removing True Citrus specific service file..." -ForegroundColor Yellow
$trueCitrusFile = "src\services\integrations\trueCitrusShopifyService.js"
if (Test-Path $trueCitrusFile) {
    Remove-Item $trueCitrusFile -Force
    Write-Host "✓ Removed $trueCitrusFile" -ForegroundColor Green
} else {
    Write-Host "✓ File already removed" -ForegroundColor Green
}

# 2. Remove test/temporary files
Write-Host ""
Write-Host "[2/6] Removing test and temporary files..." -ForegroundColor Yellow
$testFiles = @(
    "src\components\StyleTest.jsx",
    "src\components\TestComponent.jsx",
    "src\components\SmartBotTest.jsx",
    "src\components\ShopifyTest.jsx",
    "src\components\BotBuilderSaveTest.jsx",
    "src\pages\ShopifyTestPage.jsx",
    "test-security.js",
    "verify.js",
    "DEBUG_AUTH.js",
    "nul"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed $file" -ForegroundColor Green
    }
}

# 3. Remove backup files
Write-Host ""
Write-Host "[3/6] Removing backup files..." -ForegroundColor Yellow
$backupFiles = @(
    "src\components\Dashboard.jsx.backup",
    "src\components\ScenarioBuilder.jsx.backup",
    "src\components\CustomForms.jsx.backup"
)

foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed $file" -ForegroundColor Green
    }
}

# 4. Remove OLD API files
Write-Host ""
Write-Host "[4/6] Removing old API files..." -ForegroundColor Yellow
$oldApiFiles = @(
    "api\kustomer.js.OLD",
    "api\shopify.js.OLD",
    "api\scrape-discover.js.OLD",
    "api\scrape-page.js.OLD"
)

foreach ($file in $oldApiFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed $file" -ForegroundColor Green
    }
}

# 5. Clean up documentation files (keep only essential ones)
Write-Host ""
Write-Host "[5/6] Organizing documentation..." -ForegroundColor Yellow

# Create docs archive folder if needed
if (!(Test-Path "docs\archive")) {
    New-Item -ItemType Directory -Path "docs\archive" -Force | Out-Null
}

# Move old documentation to archive
$docsToArchive = @(
    "MULTI_TENANT_OAUTH_AUDIT_REPORT.md",
    "OAUTH_COMPLETE_FIX.md", 
    "SHOPIFY_FIX_SUMMARY.md",
    "FIXES_APPLIED.md",
    "BUILD_SESSION_SUMMARY.md",
    "URGENT_DIAGNOSTIC_GUIDE.md"
)

foreach ($doc in $docsToArchive) {
    if (Test-Path $doc) {
        Move-Item $doc "docs\archive\" -Force
        Write-Host "  ✓ Archived $doc" -ForegroundColor Green
    }
}

# 6. Update package.json description to be generic
Write-Host ""
Write-Host "[6/6] Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageJson.description = "AgenStack.ai - Professional multi-tenant AI chatbot platform with OAuth integrations for Shopify, Kustomer, Messenger, and Klaviyo"
$packageJson.author = "AgenStack.ai"
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Write-Host "✓ Updated package.json" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes with: git status" -ForegroundColor White
Write-Host "2. Test locally: npm run dev" -ForegroundColor White
Write-Host "3. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""
