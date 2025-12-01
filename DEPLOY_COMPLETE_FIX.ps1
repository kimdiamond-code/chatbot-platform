# Complete Deployment Fix
# Run this from PowerShell

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DEPLOYING ALL FIXES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

Write-Host "[1/4] Adding modified files..." -ForegroundColor Yellow
git add src/components/Integrations.jsx
git add src/components/ShopifyOAuthConfiguration.jsx
git add src/services/shopifyService.js

Write-Host "[2/4] Committing changes..." -ForegroundColor Yellow
git commit -m "Fix: Auth loading states, Shopify config timing, and 504 timeout handling"

Write-Host "[3/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "[4/4] Waiting for Vercel auto-deployment..." -ForegroundColor Yellow
Write-Host "GitHub webhook will trigger Vercel deployment automatically" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT INITIATED" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check deployment status at:" -ForegroundColor Green
Write-Host "https://vercel.com/kims-projects-6e623030/chatbot-platform-v2" -ForegroundColor Blue
Write-Host ""
Write-Host "Your site:" -ForegroundColor Green  
Write-Host "https://chatbot-platform-v2.vercel.app" -ForegroundColor Blue
Write-Host ""
