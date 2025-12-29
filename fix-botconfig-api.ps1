$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\services\botConfigService.js"

$content = Get-Content $file -Raw

# Replace the getPublicBotConfig function to use backend API instead of Supabase
$oldFunction = @'
  // Get public bot configuration (for widget)
  async getPublicBotConfig(organizationId = DEMO_ORG_ID) {
    try {
      console.log('📋 Loading bot config from database for org:', organizationId);
      
      const { data: botConfig, error } = await supabase
        .from('bot_configs')
        .select(`
          id,
          name,
          personality,
          qa_database,
          knowledge_base,
          settings,
          widget_configs (
            widget_settings,
            embed_code
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
'@

$newFunction = @'
  // Get public bot configuration (for widget)
  async getPublicBotConfig(organizationId = DEMO_ORG_ID) {
    try {
      console.log('📋 Loading bot config from database for org:', organizationId);
      
      // Use backend API instead of Supabase to avoid frontend errors
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getBotConfigs',
          orgId: organizationId
        })
      });
      
      const result = await response.json();
      
      if (!result.success || !result.data || result.data.length === 0) {
        console.warn('📋 No bot config found in database, using demo...');
        return this.getDefaultPublicConfigWithDemo();
      }
      
      const botConfig = result.data[0];
      const error = null;
'@

$content = $content -replace [regex]::Escape($oldFunction), $newFunction

$content | Set-Content $file

Write-Host "✅ Fixed botConfigService to use backend API instead of Supabase"
