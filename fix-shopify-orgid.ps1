$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\services\chat\integrationOrchestrator.js"

$content = Get-Content $file -Raw

# Fix getCredentials() calls - add organizationId parameter
$content = $content -replace 'await shopifyService\.getCredentials\(\)', 'await shopifyService.getCredentials(this.organizationId)'

# Fix searchProducts() calls - add organizationId parameter
$content = $content -replace 'await shopifyService\.searchProducts\(([^)]+)\)', 'await shopifyService.searchProducts($1, this.organizationId)'

# Fix getProducts() calls - add organizationId parameter  
$content = $content -replace 'await shopifyService\.getProducts\(([^)]+)\)', 'await shopifyService.getProducts($1, this.organizationId)'

$content | Set-Content $file

Write-Host "✅ Fixed Shopify organizationId parameters in integrationOrchestrator.js"
