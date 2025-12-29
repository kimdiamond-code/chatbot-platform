$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\services\chat\integrationOrchestrator.js"

$content = Get-Content $file -Raw

# Fix the broken syntax from previous regex
$content = $content -replace 'searchProducts\(\$1, this\.organizationIdaction\.query, this\.organizationId\)', 'searchProducts(action.query, this.organizationId)'
$content = $content -replace 'searchProducts\(\$1, this\.organizationIdproductQuery, this\.organizationId\)', 'searchProducts(productQuery, this.organizationId)'

$content | Set-Content $file

Write-Host "✅ Fixed syntax errors in integrationOrchestrator.js"
