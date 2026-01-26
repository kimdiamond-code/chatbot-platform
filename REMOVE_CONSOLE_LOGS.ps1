# ====================================================================
# REMOVE CONSOLE LOGS FOR PRODUCTION
# Removes console.log statements while keeping console.error and console.warn
# ====================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REMOVING CONSOLE LOGS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$filesProcessed = 0
$logsRemoved = 0

# Function to process a file
function Remove-ConsoleLogs {
    param($FilePath)
    
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    
    $originalLength = $content.Length
    
    # Remove console.log statements (but keep console.error and console.warn)
    # Pattern matches:
    # - console.log('...')
    # - console.log("...")  
    # - console.log(`...`)
    # - console.log(variable)
    # - console.log({ ... })
    
    # Remove single-line console.log statements
    $content = $content -replace "console\.log\([^;]*\);?[\r\n]*", ""
    
    # Remove multi-line console.log statements
    $content = $content -replace "console\.log\([^)]*\)[\s\S]*?;[\r\n]*", ""
    
    if ($content.Length -ne $originalLength) {
        Set-Content -Path $FilePath -Value $content -NoNewline
        $script:filesProcessed++
        $script:logsRemoved += (($originalLength - $content.Length) / 50) # Rough estimate
        Write-Host "  ✓ Processed: $FilePath" -ForegroundColor Green
    }
}

# Process API files
Write-Host "[1/3] Processing API files..." -ForegroundColor Yellow
Get-ChildItem "api" -Filter "*.js" -Recurse | ForEach-Object {
    Remove-ConsoleLogs $_.FullName
}

# Process source files
Write-Host ""
Write-Host "[2/3] Processing source files..." -ForegroundColor Yellow
Get-ChildItem "src" -Filter "*.js" -Recurse | ForEach-Object {
    Remove-ConsoleLogs $_.FullName
}
Get-ChildItem "src" -Filter "*.jsx" -Recurse | ForEach-Object {
    Remove-ConsoleLogs $_.FullName
}

# Process TypeScript files
Write-Host ""
Write-Host "[3/3] Processing TypeScript files..." -ForegroundColor Yellow
Get-ChildItem "src" -Filter "*.ts" -Recurse | ForEach-Object {
    Remove-ConsoleLogs $_.FullName
}
Get-ChildItem "src" -Filter "*.tsx" -Recurse | ForEach-Object {
    Remove-ConsoleLogs $_.FullName
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files processed: $filesProcessed" -ForegroundColor White
Write-Host "Approximate logs removed: $logsRemoved" -ForegroundColor White
Write-Host ""
Write-Host "Note: console.error and console.warn statements were preserved" -ForegroundColor Yellow
Write-Host ""
