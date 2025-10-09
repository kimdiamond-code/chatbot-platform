import { supabase, testSupabaseConnection } from './supabase.js';

// Default organization ID for demo (matches schema.sql)
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

class BotConfigService {
  constructor() {
    this.fallbackToLocalStorage = true;
  }

  // Test database connection
  async testConnection() {
    try {
      // For development, temporarily disable database to test localStorage
      console.log('💾 Development mode - using localStorage for stability');
      return false; // Force localStorage mode
      
      /* 
      // Uncomment this when database permissions are fixed:
      const connectionStatus = await testSupabaseConnection();
      return connectionStatus.connected;
      */
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // Save bot configuration
  async saveBotConfig(config) {
    // For now, prioritize localStorage for stability
    console.log('💾 Saving bot configuration...');
    
    const connected = await this.testConnection();
    
    if (connected) {
      console.log('✅ Database available - attempting database save');
      try {
        const result = await this.saveToDatabase(config);
        if (result.success) {
          console.log('✅ Configuration saved to database');
          return result;
        }
      } catch (error) {
        console.log('⚠️ Database save failed, using localStorage backup');
      }
    } else {
      console.log('📁 Database offline - using localStorage (this is normal)');
    }
    
    // Always use localStorage as reliable backup
    return this.saveToLocalStorage(config);
  }

  // Load bot configuration
  async loadBotConfig(botId = 'default') {
    const connected = await this.testConnection();
    
    if (connected) {
      return this.loadFromDatabase(botId);
    } else {
      return this.loadFromLocalStorage();
    }
  }

  // Save to Supabase database
  async saveToDatabase(config) {
    try {
      // Prepare configuration data for database
      const botConfigData = {
        organization_id: DEMO_ORG_ID,
        name: config.name || 'ChatBot Assistant',
        system_prompt: config.systemPrompt || config.directive?.systemPrompt || '',
        personality: {
          avatar: config.avatar || 'robot',
          greeting: config.greeting || 'Hello! How can I help you today?',
          fallback: config.fallback || "I'm not sure about that. Let me connect you with a human agent.",
          tone: config.tone || 'friendly',
          traits: config.traits || ['professional', 'empathetic'],
          name: config.name || 'ChatBot Assistant'
        },
        settings: {
          responseDelay: config.responseDelay || 1500,
          maxRetries: config.maxRetries || 3,
          operatingHours: config.operatingHours || { enabled: false },
          escalationKeywords: config.escalationKeywords || ['human', 'agent', 'manager']
        },
        qa_database: config.qaDatabase || [],
        knowledge_base: config.knowledgeBase || [],
        is_active: true,
        updated_at: new Date().toISOString()
      };

      // Check if bot config already exists
      const { data: existingConfig, error: selectError } = await supabase
        .from('bot_configs')
        .select('id')
        .eq('organization_id', DEMO_ORG_ID)
        .eq('is_active', true)
        .maybeSingle();

      let result;
      if (existingConfig) {
        // Update existing configuration
        result = await supabase
          .from('bot_configs')
          .update(botConfigData)
          .eq('id', existingConfig.id)
          .select()
          .single();
      } else {
        // Insert new configuration
        result = await supabase
          .from('bot_configs')
          .insert(botConfigData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Failed to save bot config to database:', result.error);
        // Fallback to localStorage
        return this.saveToLocalStorage(config);
      }

      // Also save widget configuration if present
      if (config.widget) {
        await this.saveWidgetConfig(result.data.id, config.widget);
      }

      console.log('✅ Bot configuration saved to database');
      return { success: true, data: result.data };

    } catch (error) {
      console.error('Database save error:', error);
      // Fallback to localStorage
      return this.saveToLocalStorage(config);
    }
  }

  // Load from Supabase database
  async loadFromDatabase(botId = null) {
    try {
      const { data: botConfig, error } = await supabase
        .from('bot_configs')
        .select(`
          *,
          widget_configs (
            id,
            widget_settings,
            embed_code
          )
        `)
        .eq('organization_id', DEMO_ORG_ID)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load bot config from database:', error);
        return this.loadFromLocalStorage();
      }

      if (!botConfig) {
        // Create default configuration
        const defaultConfig = this.getDefaultConfig();
        await this.saveToDatabase(defaultConfig);
        return { success: true, data: defaultConfig };
      }

      // Transform database format back to application format
      const transformedConfig = {
        // Basic info
        name: botConfig.name,
        systemPrompt: botConfig.system_prompt,
        avatar: botConfig.personality?.avatar || 'robot',
        greeting: botConfig.personality?.greeting || 'Hello! How can I help you today?',
        fallback: botConfig.personality?.fallback || "I'm not sure about that.",
        tone: botConfig.personality?.tone || 'friendly',
        traits: botConfig.personality?.traits || ['professional'],
        
        // Settings
        responseDelay: botConfig.settings?.responseDelay || 1500,
        maxRetries: botConfig.settings?.maxRetries || 3,
        operatingHours: botConfig.settings?.operatingHours || { enabled: false },
        escalationKeywords: botConfig.settings?.escalationKeywords || ['human', 'agent'],
        
        // Data
        qaDatabase: botConfig.qa_database || [],
        knowledgeBase: botConfig.knowledge_base || [],
        
        // Widget settings from joined table
        widget: botConfig.widget_configs?.[0]?.widget_settings || {
          position: 'bottom-right',
          theme: 'light',
          primaryColor: '#3B82F6',
          size: 'medium',
          autoOpen: false,
          showBranding: true
        },

        // Metadata
        id: botConfig.id,
        createdAt: botConfig.created_at,
        updatedAt: botConfig.updated_at
      };

      console.log('✅ Bot configuration loaded from database');
      return { success: true, data: transformedConfig };

    } catch (error) {
      console.error('Database load error:', error);
      return this.loadFromLocalStorage();
    }
  }

  // Save widget configuration to database
  async saveWidgetConfig(botConfigId, widgetSettings) {
    try {
      // Check if widget config exists
      const { data: existingWidget, error: selectError } = await supabase
        .from('widget_configs')
        .select('id')
        .eq('bot_config_id', botConfigId)
        .maybeSingle();

      const widgetData = {
        organization_id: DEMO_ORG_ID,
        bot_config_id: botConfigId,
        widget_settings: widgetSettings,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingWidget) {
        result = await supabase
          .from('widget_configs')
          .update(widgetData)
          .eq('id', existingWidget.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('widget_configs')
          .insert(widgetData)
          .select()
          .single();
      }

      if (result.error) {
        console.warn('Failed to save widget config:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Widget config save error:', error);
      return null;
    }
  }

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

      if (error) {
        if (error.code === '42P01') {
          console.warn('⚠️ Database tables not found. Please run the schema.sql file in Supabase.');
          console.warn('📋 Using demo configuration until database is set up.');
          return this.getDefaultPublicConfigWithDemo();
        }
        console.error('❌ Database error:', error);
        console.warn('📋 Falling back to demo configuration');
        return this.getDefaultPublicConfigWithDemo();
      }

      if (!botConfig) {
        console.warn('📋 No bot config found in database, creating default...');
        // Try to create a default config in the database
        const defaultConfig = this.getDefaultConfig();
        const saveResult = await this.saveBotConfig(defaultConfig);
        if (saveResult.success) {
          console.log('✅ Default bot config created in database');
          return {
            botId: saveResult.data.id,
            name: defaultConfig.name,
            avatar: defaultConfig.avatar,
            greeting: defaultConfig.greeting,
            fallback: defaultConfig.fallback,
            qaDatabase: defaultConfig.qaDatabase || [],
            knowledgeBase: defaultConfig.knowledgeBase || [],
            escalationKeywords: defaultConfig.escalationKeywords || [],
            responseDelay: defaultConfig.responseDelay || 1500,
            widget: defaultConfig.widget || this.getDefaultWidgetConfig(),
            settings: {
              operatingHours: defaultConfig.operatingHours || { enabled: false }
            }
          };
        } else {
          console.warn('⚠️ Could not create default config in database, using demo mode');
          return this.getDefaultPublicConfigWithDemo();
        }
      }

      console.log('✅ Bot config loaded from database successfully');
      console.log('📋 Config has', (botConfig.knowledge_base || []).length, 'knowledge base items');
      console.log('📋 Config has', (botConfig.qa_database || []).length, 'Q&A items');
      
      // Return only public-safe configuration
      return {
        botId: botConfig.id,
        name: botConfig.personality?.name || botConfig.name,
        avatar: botConfig.personality?.avatar || 'robot',
        greeting: botConfig.personality?.greeting || 'Hello! How can I help?',
        fallback: botConfig.personality?.fallback || "I'm not sure about that.",
        qaDatabase: botConfig.qa_database || [],
        knowledgeBase: botConfig.knowledge_base || [],
        escalationKeywords: botConfig.settings?.escalationKeywords || [],
        responseDelay: botConfig.settings?.responseDelay || 1500,
        widget: botConfig.widget_configs?.[0]?.widget_settings || this.getDefaultWidgetConfig(),
        settings: botConfig.settings
      };

    } catch (error) {
      console.error('❌ Error loading public bot config:', error);
      console.warn('📋 Database connection failed, using demo configuration');
      return this.getDefaultPublicConfigWithDemo();
    }
  }

  // Fallback to localStorage methods
  saveToLocalStorage(config) {
    try {
      localStorage.setItem('chatbot-config', JSON.stringify(config));
      console.log('✅ Bot configuration saved to localStorage (fallback)');
      return { success: true, data: config };
    } catch (error) {
      console.error('LocalStorage save failed:', error);
      return { success: false, error: error.message };
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('chatbot-config');
      if (saved) {
        const data = JSON.parse(saved);
        console.log('✅ Bot configuration loaded from localStorage (fallback)');
        return { success: true, data };
      } else {
        const defaultConfig = this.getDefaultConfig();
        return { success: true, data: defaultConfig };
      }
    } catch (error) {
      console.error('LocalStorage load failed:', error);
      const defaultConfig = this.getDefaultConfig();
      return { success: true, data: defaultConfig };
    }
  }

  // Default configurations
  getDefaultConfig() {
    return {
      name: 'ChatBot Assistant',
      systemPrompt: 'You are a helpful customer service assistant. You are professional, friendly, and concise.',
      avatar: 'robot',
      greeting: 'Hello! How can I help you today?',
      fallback: "I'm not sure about that. Let me connect you with a human agent.",
      tone: 'friendly',
      traits: ['professional', 'empathetic'],
      responseDelay: 1500,
      maxRetries: 3,
      operatingHours: { enabled: false, timezone: 'UTC', hours: { start: '09:00', end: '17:00' } },
      escalationKeywords: ['human', 'agent', 'manager', 'speak to someone'],
      qaDatabase: [],
      knowledgeBase: [],
      widget: this.getDefaultWidgetConfig()
    };
  }

  getDefaultWidgetConfig() {
    return {
      position: 'bottom-right',
      theme: 'light',
      primaryColor: '#3B82F6',
      size: 'medium',
      autoOpen: false,
      showBranding: true
    };
  }

  getDefaultPublicConfig() {
    return {
      botId: 'demo',
      name: 'ChatBot',
      avatar: 'robot',
      greeting: 'Hello! How can I help you today?',
      fallback: "I'm not sure about that.",
      qaDatabase: [],
      knowledgeBase: [],
      escalationKeywords: ['human', 'agent'],
      responseDelay: 1500,
      widget: this.getDefaultWidgetConfig()
    };
  }
  
  getDefaultPublicConfigWithDemo() {
    return {
      botId: 'demo',
      name: 'ChatBot',
      avatar: 'robot',
      greeting: 'Hello! How can I help you today?',
      fallback: "I'm not sure about that.",
      qaDatabase: this.getDemoQADatabase(),
      knowledgeBase: this.getDemoKnowledgeBase(),
      escalationKeywords: ['human', 'agent', 'manager', 'speak to someone'],
      responseDelay: 1500,
      widget: this.getDefaultWidgetConfig(),
      settings: {
        operatingHours: { enabled: false }
      }
    };
  }
  
  getDemoQADatabase() {
    return [
      {
        id: 'qa1',
        question: 'What are your business hours?',
        answer: 'We are open Monday through Friday from 9 AM to 6 PM EST. Our customer support team is available during these hours to assist you.',
        keywords: ['hours', 'open', 'business', 'time', 'when'],
        enabled: true,
        category: 'general'
      },
      {
        id: 'qa2',
        question: 'How can I contact support?',
        answer: 'You can contact our support team through this chat, email us at support@example.com, or call us at (555) 123-4567 during business hours.',
        keywords: ['contact', 'support', 'help', 'phone', 'email'],
        enabled: true,
        category: 'support'
      }
    ];
  }
  
  getDemoKnowledgeBase() {
    return [
      {
        id: 'kb1',
        name: 'Company Return Policy',
        content: `Return Policy

We offer a 30-day return policy for all products. Items must be returned in their original condition with all packaging and accessories.

How to Return:
1. Contact our customer service team to initiate a return
2. We will provide you with a return shipping label
3. Package the item securely in its original packaging
4. Attach the return label and ship the package

Refund Process:
- Refunds are processed within 5-7 business days after we receive your return
- Original shipping costs are non-refundable
- Return shipping is free for defective items

Exceptions:
- Custom or personalized items cannot be returned
- Software and digital products are final sale
- Items returned after 30 days may be subject to a restocking fee

For questions about returns, please contact our support team.`,
        type: 'text/plain',
        category: 'policies',
        enabled: true,
        source: 'demo',
        keywords: ['return', 'refund', 'policy', 'exchange', 'money back'],
        wordCount: 145,
        uploadDate: new Date().toISOString()
      },
      {
        id: 'kb2',
        name: 'Shipping Information',
        content: `Shipping Information

We offer several shipping options to meet your needs:

Standard Shipping (5-7 business days):
- Free on orders over $50
- $5.99 for orders under $50

Express Shipping (2-3 business days):
- $12.99 for all orders

Overnight Shipping (1 business day):
- $24.99 for all orders
- Order must be placed before 2 PM EST

International Shipping:
- Available to most countries
- 7-14 business days
- Duties and taxes may apply

Processing Time:
- Orders are processed within 1-2 business days
- Custom orders may take 3-5 business days

Tracking:
- All shipments include tracking information
- You will receive an email with tracking details once your order ships

Note: Shipping times may be longer during peak seasons or holidays.`,
        type: 'text/plain',
        category: 'support',
        enabled: true,
        source: 'demo',
        keywords: ['shipping', 'delivery', 'tracking', 'express', 'overnight', 'international'],
        wordCount: 156,
        uploadDate: new Date().toISOString()
      },
      {
        id: 'kb3',
        name: 'Product Warranty',
        content: `Product Warranty Information

All our products come with a comprehensive warranty to ensure your satisfaction:

1-Year Limited Warranty:
- Covers manufacturing defects and material issues
- Does not cover normal wear and tear or accidental damage
- Warranty begins from the date of purchase

What's Covered:
- Electronic components and hardware failures
- Software defects and compatibility issues
- Premature wear of moving parts

What's NOT Covered:
- Physical damage from drops or impacts
- Water damage or exposure to extreme conditions
- Modifications or unauthorized repairs
- Normal wear and tear

Warranty Claims:
- Contact customer service with your order number
- Provide photos or description of the issue
- We may require return of the defective item
- Approved claims result in free repair or replacement

Extended Warranty:
- Available for purchase at checkout
- Extends coverage to 2 or 3 years
- Includes accidental damage protection

For warranty service, please contact our technical support team.`,
        type: 'text/plain',
        category: 'policies',
        enabled: true,
        source: 'demo',
        keywords: ['warranty', 'guarantee', 'defect', 'repair', 'replacement', 'coverage'],
        wordCount: 178,
        uploadDate: new Date().toISOString()
      }
    ];
  }

  // Utility methods
  async deleteConfig(configId) {
    const connected = await this.testConnection();
    
    if (connected) {
      try {
        const { error } = await supabase
          .from('bot_configs')
          .update({ is_active: false })
          .eq('id', configId);
        
        return { success: !error, error };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      localStorage.removeItem('chatbot-config');
      return { success: true };
    }
  }

  async duplicateConfig(configId) {
    const { success, data } = await this.loadBotConfig(configId);
    if (success) {
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;
      data.name = `${data.name} (Copy)`;
      return this.saveBotConfig(data);
    }
    return { success: false, error: 'Config not found' };
  }
}

// Export singleton instance
export const botConfigService = new BotConfigService();
export default botConfigService;