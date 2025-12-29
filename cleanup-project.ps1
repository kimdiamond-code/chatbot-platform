# COMPREHENSIVE CLEANUP SCRIPT
# Removes: True Citrus references, Supabase code, Demo mode

$projectRoot = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

Write-Host "Starting comprehensive cleanup..." -ForegroundColor Cyan

# 1. Find and list all files with True Citrus references
Write-Host "`nFinding True Citrus references..." -ForegroundColor Yellow
$trueCitrusFiles = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include *.js,*.jsx,*.ts,*.tsx | 
    Select-String -Pattern "true.?citrus|truecitrus" -CaseSensitive:$false | 
    Select-Object -ExpandProperty Path -Unique

if ($trueCitrusFiles) {
    Write-Host "Found True Citrus in:" -ForegroundColor Red
    $trueCitrusFiles | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "No True Citrus references found" -ForegroundColor Green
}

# 2. Find and list all Supabase files
Write-Host "`nFinding Supabase references..." -ForegroundColor Yellow
$supabaseFiles = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include *.js,*.jsx,*.ts,*.tsx | 
    Select-String -Pattern "supabase|from.*supabase" | 
    Select-Object -ExpandProperty Path -Unique

if ($supabaseFiles) {
    Write-Host "Found Supabase in:" -ForegroundColor Red
    $supabaseFiles | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "No Supabase references found" -ForegroundColor Green
}

# 3. Find demo mode references
Write-Host "`nFinding demo mode references..." -ForegroundColor Yellow
$demoFiles = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include *.js,*.jsx,*.ts,*.tsx | 
    Select-String -Pattern "demo.?mode|DEMO_ORG|demo.?config|using demo" -CaseSensitive:$false | 
    Select-Object -ExpandProperty Path -Unique

if ($demoFiles) {
    Write-Host "Found demo mode in:" -ForegroundColor Yellow
    $demoFiles | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "No demo mode references found" -ForegroundColor Green
}

# 4. List files that should be deleted
Write-Host "`nFiles to delete:" -ForegroundColor Red
$filesToDelete = @(
    "$projectRoot\src\services\supabase.js"
    "$projectRoot\src\services\demoShopifyService.js"
    "$projectRoot\src\components\ShopifyOAuthConfiguration-FIXED.jsx"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "  - $file" -ForegroundColor Red
    }
}

Write-Host "`nREVIEW THE LISTS ABOVE" -ForegroundColor Yellow
Write-Host "Files will be deleted and botConfigService.js will be rewritten." -ForegroundColor Yellow
Write-Host "Do you want to proceed with cleanup? (y/n): " -NoNewline
$confirm = Read-Host

if ($confirm -eq "y") {
    Write-Host "`nCleaning up..." -ForegroundColor Cyan
    
    # Delete unnecessary files
    foreach ($file in $filesToDelete) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Host "  Deleted: $file" -ForegroundColor Green
        }
    }
    
    # Create clean botConfigService.js
    Write-Host "`nCreating clean botConfigService.js..." -ForegroundColor Cyan
    
    & "$projectRoot\create-clean-botconfig.ps1"
    
    Write-Host "`nCleanup complete!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Review the changes" -ForegroundColor White
    Write-Host "2. Run: vercel --prod" -ForegroundColor White
    Write-Host "3. Refresh the page and test" -ForegroundColor White
    
} else {
    Write-Host "`nCleanup cancelled" -ForegroundColor Red
}
