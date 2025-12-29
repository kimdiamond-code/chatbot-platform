$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\hooks\useMessages.js"

$content = Get-Content $file -Raw

# Remove the demo mode check and import
$content = $content -replace "// Check if we're in demo mode by verifying Shopify connection.*?const \{ demoShopifyService \} = await import\('\.\./services/demoShopifyService'\);.*?const result = await demoShopifyService\.mockAddToCart\(.*?\);.*?console\.log\('✅ Demo cart created:', result\);.*?\} else \{", @'
// Add to real Shopify cart
        try {
'@

# Remove demo mode references
$content = $content -replace 'let isDemoMode = false;', ''
$content = $content -replace 'isDemoMode = !\(await shopifyService\.verifyConnection\(\)\);', ''
$content = $content -replace "console\.log\('🎭 DEMO MODE: Mock add to cart'\);", ''
$content = $content -replace "console\.log\('✅ Real Shopify: Adding to cart'\);", 'console.log("Adding to cart via Shopify...");'
$content = $content -replace '\$\{isDemoMode \? '' \(Demo Mode\)'' : ''''\}', ''
$content = $content -replace 'demoMode: isDemoMode', ''
$content = $content -replace 'const errorMessage = isDemoMode.*?\n.*?:', 'const errorMessage ='

$content | Set-Content $file

Write-Host "Fixed useMessages.js - removed demo mode" -ForegroundColor Green
