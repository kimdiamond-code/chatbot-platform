# PowerShell Deployment Script
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deploying Conversations Feature" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

Write-Host "Adding changes to git..." -ForegroundColor Yellow
git add .

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Feature: Rename Live Chat to Conversations + Add edit, multi-select, bulk delete + Widget-style preview"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Changes pushed to GitHub" -ForegroundColor Green
Write-Host "⏳ Vercel will auto-deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
