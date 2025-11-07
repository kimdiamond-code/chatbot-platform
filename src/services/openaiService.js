// ChatBot Service with OpenAI Integration - MULTI-TENANT VERSION
// Handles AI responses with per-organization bot configurations
// Loads bot settings from database per organization

import promptSecurityService from './promptSecurity.js';
import trainingService from './trainingService.js';
import botConfigService from './botConfigService.js';

// Utility functions
const retryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000);

const safeJSONParse = async (response) => {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      console.log('📝 Raw response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (e) {
    console.error('❌ Response Text Error:', e);
    throw new Error('Failed to read response body');
  }
};

const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await safeJSONParse(response);
  } catch (error) {
    console.error(`❌ Fetch Error (${url}):`, error);
    throw error;
  }
};

// Custom error classes
class ChatBotError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ChatBotError';
    this.code = code;
    this.details = details;
  }
}

class APIError extends ChatBotError {
  constructor(message, details = {}) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

class ValidationError extends ChatBotError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class SecurityError extends ChatBotError {
  constructor(message, details = {}) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

class ChatBotService {
  // Error handler methods
  handleApiError(error) {
    console.error('❌ API Error:', error);
    throw new APIError('OpenAI API error', { originalError: error });
  }

  handleConnectionError(error) {
    console.error('❌ Connection Error:', error);
    throw new APIError('Connection error', { originalError: error });
  }

  constructor() {
    this.conversations = new Map(); // Store conversation contexts
    this.botConfigs = new Map(); // Cache bot configs per organization
    this.openaiClient = null;
    this.maxPromptLength = 8000;
    this.maxRetries = 3;
    
    // Fallback system prompt (used only if database is unavailable)
    this.fallbackSystemPrompt = "You are a helpful customer service assistant for the connected e-commerce store. You are professional, friendly, and concise.\n\n" + 
      "IMPORTANT RULES:\n" +
      "- You work ONLY for this store - NEVER suggest other websites, competitors, or external retailers\n" +
      "- NEVER say 'I don't have access to' or 'I cannot browse' - you DO have access to this store's data\n" +
      "- When customers ask about products, ALWAYS search the store's catalog\n" +
      "- If a product isn't found, say it's not currently available in THIS store, offer alternatives from THIS store\n" +
      "- NEVER recommend customers go elsewhere\n\n" +
      "You help customers with:\n" +
      "1. Product search and recommendations (use store's catalog)\n" +
      "2. Order tracking (ask for email if needed)\n" +
      "3. Shopping assistance (help with cart)\n" +
      "4. Store policies and information\n\n" +
      "For product questions:\n" +
      "- Search the store's products immediately\n" +
      "- Show relevant items with details and prices\n" +
      "- Offer alternatives from the same store if needed\n\n" +
      "For order tracking:\n" +
      "- Ask for customer's email address politely\n" +
      "- Look up their order status\n" +
      "- Provide tracking information\n\n" +
      "Always be helpful and focused on THIS store's offerings only.";

    // Initialize error handlers
    this.handleApiError = this.handleApiError.bind(this);
    this.handleConnectionError = this.handleConnectionError.bind(this);
  }

  /**
   * Load bot configuration for a specific organization from database
   * This is the KEY METHOD that makes the platform multi-tenant
   */
  async loadBotConfigForOrg(organizationId) {
    try {
      // Check cache first
      if (this.botConfigs.has(organizationId)) {
        const cached = this.botConfigs.get(organizationId);
        // Cache for 5 minutes
        if (Date.now() - cached.timestamp < 300000) {
          console.log('✅ Using cached bot config for org:', organizationId);
          return cached.config;
        }
      }

      console.log('📋 Loading bot config from database for org:', organizationId);
      
      // Load from database
      const publicConfig = await botConfigService.getPublicBotConfig(organizationId);
      
      if (!publicConfig) {
        console.warn('⚠️ No bot config found, using fallback');
        return null;
      }

      // Cache the config
      this.botConfigs.set(organizationId, {
        config: publicConfig,
        timestamp: Date.now()
      });

      console.log('✅ Bot config loaded for org:', organizationId);
      console.log('📋 Bot name:', publicConfig.name);
      console.log('📋 Knowledge base items:', publicConfig.knowledgeBase?.length || 0);
      console.log('📋 Q&A items:', publicConfig.qaDatabase?.length || 0);
      
      return publicConfig;
    } catch (error) {
      console.error('❌ Error loading bot config for org:', organizationId, error);
      return null;
    }
  }

  /**
   * Build system prompt from organization's bot configuration
   * Uses their custom settings from Bot Builder
   */
  buildSystemPromptFromConfig(botConfig) {
    if (!botConfig) {
      console.warn('⚠️ No bot config provided, using fallback prompt');
      return promptSecurityService.createSecureSystemPrompt(this.fallbackSystemPrompt);
    }

    // Start with custom system prompt from their Bot Builder
    let systemPrompt = '';
    
    // Get the system_prompt from database (stored when they configure in Bot Builder)
    if (botConfig.systemPrompt) {
      systemPrompt = botConfig.systemPrompt;
      console.log('✅ Using custom system prompt from Bot Builder');
    } else {
      // Fallback to building from personality settings
      systemPrompt = `You are ${botConfig.name || 'a helpful assistant'}.\n\n`;
      
      if (botConfig.greeting) {
        systemPrompt += `Greeting: "${botConfig.greeting}"\n\n`;
      }
      
      if (botConfig.personality?.tone) {
        systemPrompt += `Tone: ${botConfig.personality.tone}\n`;
      }
      
      if (botConfig.personality?.traits && botConfig.personality.traits.length > 0) {
        systemPrompt += `Traits: ${botConfig.personality.traits.join(', ')}\n\n`;
      }
      
      systemPrompt += this.fallbackSystemPrompt;
      console.log('✅ Built system prompt from personality settings');
    }

    // Add knowledge base context if available
    if (botConfig.knowledgeBase && botConfig.knowledgeBase.length > 0) {
      systemPrompt += '\n\n=== KNOWLEDGE BASE ===\n';
      systemPrompt += 'You have access to the following information about this business:\n\n';
      
      botConfig.knowledgeBase.forEach((kb, index) => {
        if (kb.enabled !== false) {
          systemPrompt += `${index + 1}. ${kb.name || 'Document ' + (index + 1)}\n`;
          systemPrompt += `${kb.content}\n\n`;
        }
      });
      
      console.log('✅ Added', botConfig.knowledgeBase.length, 'knowledge base items to prompt');
    }

    // Add Q&A database context if available
    if (botConfig.qaDatabase && botConfig.qaDatabase.length > 0) {
      systemPrompt += '\n\n=== FREQUENTLY ASKED QUESTIONS ===\n';
      systemPrompt += 'Here are common questions and their answers:\n\n';
      
      botConfig.qaDatabase.forEach((qa, index) => {
        if (qa.enabled !== false) {
          systemPrompt += `Q: ${qa.question}\n`;
          systemPrompt += `A: ${qa.answer}\n\n`;
        }
      });
      
      console.log('✅ Added', botConfig.qaDatabase.length, 'Q&A items to prompt');
    }

    // Secure the prompt against injection
    return promptSecurityService.createSecureSystemPrompt(systemPrompt);
  }

  /**
   * Generate AI response using OpenAI API with organization-specific config
   * THIS IS THE MAIN METHOD - Now loads config per organization
   */
  async generateResponse(userMessage, conversationId, customerContext = {}) {
    try {
      console.log('🤖 Generating OpenAI response for:', userMessage.substring(0, 50));
      
      // Extract organization ID from customer context or conversation ID
      const organizationId = customerContext.organizationId || 
                            customerContext.organization_id || 
                            '00000000-0000-0000-0000-000000000001'; // Default demo org
      
      console.log('🏢 Organization ID:', organizationId);
      
      // SECURITY CHECK: Detect prompt injection attempts
      const securityCheck = promptSecurityService.detectInjection(userMessage, conversationId);
      if (!securityCheck.isSafe) {
        console.warn('🚨 Prompt injection attempt blocked:', securityCheck.reason);
        
        return {
          response: securityCheck.message || 'I\'m here to help you with your shopping needs. How can I assist you today?',
          confidence: 1.0,
          source: 'security',
          metadata: {
            blocked: true,
            reason: securityCheck.reason
          }
        };
      }

      // SECURITY: Sanitize user input
      const sanitizedMessage = promptSecurityService.sanitizeInput(userMessage);
      
      // MULTI-TENANT: Load organization-specific bot config from database
      const botConfig = await this.loadBotConfigForOrg(organizationId);
      
      // Build system prompt from their Bot Builder configuration
      const organizationSystemPrompt = this.buildSystemPromptFromConfig(botConfig);
      
      // Get or create conversation context
      let conversation = this.conversations.get(conversationId) || {
        messages: [],
        organizationId: organizationId,
        systemPrompt: organizationSystemPrompt
      };

      // Update system prompt if organization config changed
      conversation.systemPrompt = organizationSystemPrompt;
      conversation.organizationId = organizationId;

      // ADD TRAINING CONTEXT to system prompt
      let enhancedSystemPrompt = conversation.systemPrompt;
      const trainingContext = trainingService.getTrainingContext();
      if (trainingContext) {
        enhancedSystemPrompt = conversation.systemPrompt + trainingContext;
        console.log('📚 Added training context to bot prompt');
      }

      // SECURITY: Create safe user message object
      const safeUserMessage = {
        role: 'user',
        content: sanitizedMessage
      };

      // Build messages array for OpenAI with organization's custom prompt
      const messages = [
        { role: 'system', content: enhancedSystemPrompt }, // Organization's custom prompt
        ...conversation.messages.slice(-10), // Keep last 10 messages for context
        safeUserMessage
      ];

      console.log('🔄 Calling OpenAI with organization-specific configuration');

      // Call OpenAI API via backend proxy
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'openai',
          action: 'chat',
          messages: messages,
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate response');
      }

      const result = await response.json();
      const data = result.data;
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response right now.';

      // Update conversation history with sanitized messages
      conversation.messages.push(
        safeUserMessage,
        { role: 'assistant', content: aiResponse }
      );
      this.conversations.set(conversationId, conversation);

      console.log('✅ OpenAI response generated with organization config');
      console.log('🏢 Used config for org:', organizationId);
      
      return {
        response: aiResponse,
        confidence: 0.8,
        source: 'openai',
        metadata: {
          model: 'gpt-4o-mini',
          tokens: data.usage?.total_tokens || 0,
          securityChecked: true,
          trainingApplied: !!trainingContext,
          organizationId: organizationId,
          usedCustomConfig: !!botConfig
        }
      };
    } catch (error) {
      console.error('❌ OpenAI generateResponse error:', error);
      
      // Don't expose internal errors
      if (error instanceof SecurityError) {
        return {
          response: 'I\'m here to help you with your shopping needs. How can I assist you today?',
          confidence: 1.0,
          source: 'security',
          metadata: {
            blocked: true,
            error: 'security_violation'
          }
        };
      }
      
      throw error;
    }
  }

  /**
   * Clear cached config for an organization (call when config is updated)
   */
  clearOrgConfigCache(organizationId) {
    this.botConfigs.delete(organizationId);
    console.log('🗑️ Cleared cached config for org:', organizationId);
  }

  /**
   * Clear all cached configs
   */
  clearAllConfigCache() {
    this.botConfigs.clear();
    console.log('🗑️ Cleared all cached bot configs');
  }

  // Sanitize and validate prompt content
  sanitizePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      console.warn('⚠️ Invalid prompt format, using fallback');
      return this.fallbackSystemPrompt;
    }

    try {
      let sanitized = prompt
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        .replace(/\u2028/g, '\\n')
        .replace(/\u2029/g, '\\n\\n');

      JSON.parse(`"${sanitized}"`);

      if (sanitized.length > this.maxPromptLength) {
        sanitized = sanitized.substring(0, this.maxPromptLength - 3) + '...';
      }

      return promptSecurityService.createSecureSystemPrompt(sanitized);
    } catch (error) {
      console.error('❌ Prompt sanitization error:', error);
      return this.fallbackSystemPrompt;
    }
  }

  // Update bot configuration - DEPRECATED - Use database instead
  updateBotConfig(conversationId, config) {
    console.warn('⚠️ updateBotConfig is deprecated - bot configs now load from database per organization');
    console.warn('⚠️ Use Bot Builder to update configuration');
  }

  // Get conversation context
  getConversationContext(conversationId) {
    return this.conversations.get(conversationId) || { messages: [] };
  }

  // Clear conversation context
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
    promptSecurityService.clearConversationTracking(conversationId);
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return promptSecurityService.getSecurityStats();
  }

  /**
   * Get training statistics
   */
  getTrainingStats() {
    return trainingService.getStats();
  }
}

// Create singleton instance
const service = new ChatBotService();

// Add diagnostic functions in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    if (event.reason instanceof SyntaxError && event.reason.message.includes('JSON')) {
      console.log('📝 JSON Parse Error Details:', {
        message: event.reason.message,
        stack: event.reason.stack
      });
    }
  });

  // Test with organization ID
  window.testChatBot = async (message = 'Hello, test message', organizationId = null) => {
    try {
      if (!message || typeof message !== 'string') {
        throw new ValidationError('Invalid message format');
      }
      return await service.generateResponse(
        message, 
        'browser-test',
        { organizationId: organizationId || '00000000-0000-0000-0000-000000000001' }
      );
    } catch (error) {
      console.error('Test error:', error);
      return { success: false, error: error.message };
    }
  };

  // Test loading org config
  window.testLoadOrgConfig = async (organizationId = '00000000-0000-0000-0000-000000000001') => {
    try {
      return await service.loadBotConfigForOrg(organizationId);
    } catch (error) {
      console.error('Config load error:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear config cache
  window.clearConfigCache = (organizationId = null) => {
    if (organizationId) {
      service.clearOrgConfigCache(organizationId);
    } else {
      service.clearAllConfigCache();
    }
    return { success: true, message: 'Cache cleared' };
  };

  window.getSecurityStats = () => {
    return service.getSecurityStats();
  };

  window.testPromptSecurity = (testMessage) => {
    return promptSecurityService.detectInjection(testMessage, 'test-conversation');
  };

  window.getTrainingStats = () => {
    return service.getTrainingStats();
  };
}

// Export both default and named exports
export const chatBotService = service;
export default service;
