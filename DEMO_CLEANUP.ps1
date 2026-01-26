# ===================================================================
# DEMO CLEANUP SCRIPT - Remove True Citrus references and console logs
# ===================================================================

Write-Host " Starting Demo Cleanup..." -ForegroundColor Cyan

# 1. Delete True Citrus specific service file
Write-Host "`n Step 1: Removing True Citrus service file..." -ForegroundColor Yellow
$trueCitrusFile = "src\services\integrations\trueCitrusShopifyService.js"
if (Test-Path $trueCitrusFile) {
    Remove-Item $trueCitrusFile -Force
    Write-Host " Deleted: $trueCitrusFile" -ForegroundColor Green
} else {
    Write-Host " File already removed: $trueCitrusFile" -ForegroundColor Gray
}

Write-Host "`n CLEANUP COMPLETE!" -ForegroundColor Green
