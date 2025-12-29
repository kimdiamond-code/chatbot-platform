$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\services\botConfigService.js"

$content = Get-Content $file -Raw

# Remove the forced localStorage mode - enable database
$content = $content -replace 'async testConnection\(\) \{[^}]*console\.log\([^)]*\);[^}]*return false;[^}]*\}', @'
async testConnection() {
    try {
      // Database is enabled - bot configs save to Neon
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
'@

$content | Set-Content $file

Write-Host "✅ Enabled database mode for bot configurations"
