// Real API Keys Integration Service
// src/services/apiKeysService.js

class APIKeysService {
  constructor() {
    this.apiKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      shopify: {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        apiSecret: import.meta.env.VITE_SHOPIFY_API_SECRET,
        storeName: import.meta.env.VITE_SHOPIFY_STORE_NAME,
        accessToken: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN
      },
      kustomer: {
        apiKey: import.meta.env.VITE_KUSTOMER_API_KEY,
        orgId: import.meta.env.VITE_KUSTOMER_ORG_ID
      },
      klaviyo: {
        apiKey: import.meta.env.VITE_KLAVIYO_API_KEY
      },
      whatsapp: {
        accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
        verifyToken: import.meta.env.VITE_WHATSAPP_VERIFY_TOKEN
      },
      facebook: {
        pageAccessToken: import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN,
        pageId: import.meta.env.VITE_FACEBOOK_PAGE_ID,
        appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET
      },
      slack: {
        botToken: import.meta.env.VITE_SLACK_BOT_TOKEN,
        signingSecret: import.meta.env.VITE_SLACK_SIGNING_SECRET
      },
      zapier: {
        webhookUrl: import.meta.env.VITE_ZAPIER_WEBHOOK_URL
      }
    };
  }

  // Check if API key exists and is valid format
  hasValidKey(service) {
    switch (service) {
      case 'openai':
        return !!this.apiKeys.openai && this.apiKeys.openai.startsWith('sk-');
      case 'shopify':
        return !!(this.apiKeys.shopify.apiKey && this.apiKeys.shopify.storeName);
      case 'kustomer':
        return !!(this.apiKeys.kustomer.apiKey && this.apiKeys.kustomer.orgId);
      case 'klaviyo':
        return !!this.apiKeys.klaviyo.apiKey;
      case 'whatsapp':
        return !!(this.apiKeys.whatsapp.accessToken && this.apiKeys.whatsapp.phoneNumberId);
      case 'facebook':
        return !!(this.apiKeys.facebook.pageAccessToken && this.apiKeys.facebook.pageId);
      case 'slack':
        return !!this.apiKeys.slack.botToken;
      case 'zapier':
        return !!this.apiKeys.zapier.webhookUrl;
      default:
        return false;
    }
  }

  // Get API keys for a service
  getKeys(service) {
    return this.apiKeys[service] || null;
  }

  // Test API connection for each service
  async testConnection(service) {
    if (!this.hasValidKey(service)) {
      return { 
        success: false, 
        message: `API keys missing for ${service}. Add them to your .env file.`,
        needsSetup: true 
      };
    }

    try {
      switch (service) {
        case 'openai':
          return await this.testOpenAI();
        case 'shopify':
          return await this.testShopify();
        case 'kustomer':
          return await this.testKustomer();
        case 'klaviyo':
          return await this.testKlaviyo();
        case 'whatsapp':
          return await this.testWhatsApp();
        case 'facebook':
          return await this.testFacebook();
        case 'slack':
          return await this.testSlack();
        case 'zapier':
          return { success: true, message: 'Zapier webhook configured' };
        default:
          return { success: false, message: 'Unknown service' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error.message}`,
        error: error 
      };
    }
  }

  // Test OpenAI connection (browser-safe version)
  async testOpenAI() {
    // Due to CORS restrictions, we can't directly test OpenAI API from browser
    // Instead, we'll validate the key format and provide helpful info
    const apiKey = this.apiKeys.openai;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'OpenAI API key not found in environment variables',
        needsSetup: true
      };
    }
    
    if (!apiKey.startsWith('sk-')) {
      return {
        success: false,
        message: 'Invalid OpenAI API key format. Should start with "sk-"',
        needsSetup: true
      };
    }
    
    // Key format is valid
    return { 
      success: true, 
      message: 'OpenAI API key configured (format validated)',
      data: { keyLength: apiKey.length, format: 'valid' }
    };
  }

  // Test Shopify connection using Dynamic service
  async testShopify() {
    try {
      // Import the Dynamic Shopify service
      const { dynamicShopifyService } = await import('./integrations/dynamicShopifyService.js');
      
      // Test connection using our dynamic service
      const result = await dynamicShopifyService.testConnection();
      
      if (result.success) {
        return {
          success: true,
          message: `✅ Shopify Store Connected: ${result.data?.shopName || 'Store'}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: result.message,
          needsSetup: result.needsSetup
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Shopify connection failed: ${error.message}`
      };
    }
  }

  // Test Kustomer connection - REAL API
  async testKustomer() {
    const { apiKey, orgId } = this.apiKeys.kustomer;
    
    if (!apiKey || !orgId) {
      throw new Error('Missing Kustomer API key or organization ID');
    }

    try {
      const response = await fetch('https://api.kustomerapp.com/v1/customers?page[limit]=1', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Kustomer API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        message: 'Kustomer API connected successfully',
        data: { customerCount: data.meta?.totalCount || 'N/A' }
      };
    } catch (error) {
      return {
        success: false,
        message: `Kustomer connection failed: ${error.message}`
      };
    }
  }

  // Test Klaviyo connection - REAL API
  async testKlaviyo() {
    const { apiKey } = this.apiKeys.klaviyo;
    
    if (!apiKey) {
      throw new Error('Missing Klaviyo API key');
    }

    try {
      const response = await fetch('https://a.klaviyo.com/api/accounts/', {
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'revision': '2023-12-15'
        }
      });

      if (!response.ok) {
        throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        message: 'Klaviyo API connected successfully',
        data: { accountId: data.data?.[0]?.id || 'Connected' }
      };
    } catch (error) {
      return {
        success: false,
        message: `Klaviyo connection failed: ${error.message}`
      };
    }
  }

  // Test WhatsApp connection - REAL API
  async testWhatsApp() {
    const { accessToken, phoneNumberId } = this.apiKeys.whatsapp;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('Missing WhatsApp access token or phone number ID');
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        message: `WhatsApp Business API connected - Phone: ${data.display_phone_number || phoneNumberId}`,
        data: { phoneNumber: data.display_phone_number }
      };
    } catch (error) {
      return {
        success: false,
        message: `WhatsApp connection failed: ${error.message}`
      };
    }
  }

  // Test Facebook connection - REAL API
  async testFacebook() {
    const { pageAccessToken, pageId } = this.apiKeys.facebook;
    
    if (!pageAccessToken || !pageId) {
      throw new Error('Missing Facebook page access token or page ID');
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}?access_token=${pageAccessToken}`);
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        message: `Connected to Facebook Page: ${data.name}`,
        data: { pageName: data.name, pageId: data.id }
      };
    } catch (error) {
      return {
        success: false,
        message: `Facebook connection failed: ${error.message}`
      };
    }
  }

  // Test Slack connection - REAL API
  async testSlack() {
    const { botToken } = this.apiKeys.slack;
    
    if (!botToken) {
      throw new Error('Missing Slack bot token');
    }

    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Slack authentication failed: ${data.error}`);
      }

      return { 
        success: true, 
        message: `Connected to Slack team: ${data.team}`,
        data: { teamName: data.team, userId: data.user_id }
      };
    } catch (error) {
      return {
        success: false,
        message: `Slack connection failed: ${error.message}`
      };
    }
  }

  // Get OpenAI chat completion (browser-compatible version)
  async getChatCompletion(messages, options = {}) {
    if (!this.hasValidKey('openai')) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        body: JSON.stringify({
          model: options.model || 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: options.max_tokens || 150,
          temperature: options.temperature || 0.7,
          ...options
        })
      });

      // Handle CORS errors specifically
      if (!response.ok) {
        if (response.status === 0 || !response.status) {
          throw new Error('CORS_ERROR');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
      
    } catch (error) {
      // Handle specific error types
      if (error.message === 'CORS_ERROR' || error.name === 'TypeError' && error.message.includes('fetch')) {
        // CORS error - provide helpful message
        throw new Error('CORS_BLOCKED: Direct OpenAI API calls are blocked by browser security. This is normal in development. In production, you\'d use a server-side proxy.');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  // Generate environment variables template
  generateEnvTemplate() {
    return `# API Keys Configuration for Chatbot Platform
# Copy this to your .env file and add your actual API keys

# OpenAI (Required for bot responses)
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Shopify Integration
VITE_SHOPIFY_API_KEY=your-shopify-api-key
VITE_SHOPIFY_API_SECRET=your-shopify-api-secret
VITE_SHOPIFY_STORE_NAME=your-store-name
VITE_SHOPIFY_ACCESS_TOKEN=your-shopify-access-token

# Kustomer CRM Integration
VITE_KUSTOMER_API_KEY=your-kustomer-api-key
VITE_KUSTOMER_ORG_ID=your-kustomer-org-id

# Klaviyo Email Marketing
VITE_KLAVIYO_API_KEY=your-klaviyo-api-key

# WhatsApp Business (via Meta)
VITE_WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
VITE_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
VITE_WHATSAPP_VERIFY_TOKEN=your-verify-token

# Facebook Messenger
VITE_FACEBOOK_PAGE_ACCESS_TOKEN=your-page-access-token
VITE_FACEBOOK_PAGE_ID=your-page-id
VITE_FACEBOOK_APP_SECRET=your-app-secret

# Slack Integration
VITE_SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
VITE_SLACK_SIGNING_SECRET=your-slack-signing-secret

# Zapier Webhooks
VITE_ZAPIER_WEBHOOK_URL=your-zapier-webhook-url

# Supabase (Already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`;
  }
}

export const apiKeysService = new APIKeysService();
export default APIKeysService;