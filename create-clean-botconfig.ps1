$projectRoot = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
$targetFile = "$projectRoot\src\services\botConfigService.js"

$content = @'
// Bot Configuration Service - Uses Neon Database via Backend API
// NO Supabase, NO Demo Mode, NO True Citrus

class BotConfigService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get bot configuration from backend API
  async getPublicBotConfig(organizationId) {
    if (!organizationId) {
      console.error('❌ organizationId required');
      return this.getMinimalFallback();
    }

    // Check cache
    const cached = this.cache.get(organizationId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('✅ Using cached bot config');
      return cached.config;
    }

    try {
      console.log('📋 Loading bot config from database for org:', organizationId);
      
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
        console.warn('⚠️ No bot config found');
        return this.getMinimalFallback();
      }
      
      const botConfig = result.data[0];
      
      // Transform to expected format
      const config = {
        botId: botConfig.id,
        name: botConfig.name || 'Assistant',
        systemPrompt: botConfig.instructions || '',
        greeting: botConfig.greeting_message || 'Hello! How can I help?',
        fallback: botConfig.fallback_message || "I'm not sure about that.",
        qaDatabase: [],
        knowledgeBase: [],
        escalationKeywords: ['human', 'agent', 'manager'],
        responseDelay: 1500,
        settings: botConfig.settings || {}
      };
      
      // Cache it
      this.cache.set(organizationId, {
        config,
        timestamp: Date.now()
      });
      
      console.log('✅ Bot config loaded from database');
      return config;
      
    } catch (error) {
      console.error('❌ Error loading bot config:', error);
      return this.getMinimalFallback();
    }
  }

  // Minimal fallback (no demo data)
  getMinimalFallback() {
    return {
      botId: 'fallback',
      name: 'Assistant',
      systemPrompt: 'You are a helpful e-commerce assistant. Help customers with product search, order tracking, and shopping assistance.',
      greeting: 'Hello! How can I help you today?',
      fallback: "I'm not sure about that.",
      qaDatabase: [],
      knowledgeBase: [],
      escalationKeywords: ['human', 'agent', 'manager'],
      responseDelay: 1500,
      settings: {}
    };
  }

  // Clear cache for organization
  clearCache(organizationId) {
    if (organizationId) {
      this.cache.delete(organizationId);
    } else {
      this.cache.clear();
    }
  }
}

export const botConfigService = new BotConfigService();
export default botConfigService;
'@

$content | Set-Content $targetFile -Force
Write-Host "✅ Created clean botConfigService.js" -ForegroundColor Green
