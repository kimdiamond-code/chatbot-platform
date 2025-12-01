// ===================================================================
// CENTRALIZED INTEGRATION SERVICE
// Handles all external API integrations with admin credentials
// Users only provide account identifiers (store name, subdomain, etc.)
// ===================================================================

class IntegrationService {
  constructor() {
    this.initialized = false;
    this.credentials = {};
    this.loadCredentials();
  }

  loadCredentials() {
    // Load admin credentials from environment
    this.credentials = {
      shopify: {
        apiKey: import.meta.env.VITE_SHOPIFY_ADMIN_API_KEY || import.meta.env.VITE_SHOPIFY_API_KEY,
        apiSecret: import.meta.env.VITE_SHOPIFY_ADMIN_API_SECRET || import.meta.env.VITE_SHOPIFY_API_SECRET,
        accessToken: import.meta.env.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN || import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
      },
      klaviyo: {
        privateKey: import.meta.env.VITE_KLAVIYO_PRIVATE_API_KEY,
      },
      kustomer: {
        apiKey: import.meta.env.VITE_KUSTOMER_API_KEY,
      },
      messenger: {
        appId: import.meta.env.VITE_MESSENGER_APP_ID,
        appSecret: import.meta.env.VITE_MESSENGER_APP_SECRET,
        pageAccessToken: import.meta.env.VITE_MESSENGER_PAGE_ACCESS_TOKEN,
        verifyToken: import.meta.env.VITE_MESSENGER_VERIFY_TOKEN,
      },
      twilio: {
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
        whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER,
      },
      stripe: {
        secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
      },
      openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        orgId: import.meta.env.VITE_OPENAI_ORG_ID,
      }
    };
    this.initialized = true;
  }

  // Check if a provider is configured
  isProviderConfigured(provider) {
    const creds = this.credentials[provider];
    if (!creds) return false;

    switch (provider) {
      case 'shopify':
        return !!(creds.apiKey && creds.apiSecret && creds.accessToken);
      case 'klaviyo':
        return !!creds.privateKey;
      case 'kustomer':
        return !!creds.apiKey;
      case 'messenger':
        return !!(creds.appId && creds.appSecret && creds.pageAccessToken);
      case 'twilio':
        return !!(creds.accountSid && creds.authToken);
      case 'stripe':
        return !!creds.secretKey;
      case 'openai':
        return !!creds.apiKey;
      default:
        return false;
    }
  }

  // Get configured providers
  getConfiguredProviders() {
    return Object.keys(this.credentials).filter(provider => 
      this.isProviderConfigured(provider)
    );
  }

  // Get provider status
  getProviderStatus() {
    const providers = ['shopify', 'klaviyo', 'kustomer', 'messenger', 'twilio', 'stripe', 'openai'];
    return providers.map(provider => ({
      provider,
      configured: this.isProviderConfigured(provider),
      name: this.getProviderDisplayName(provider)
    }));
  }

  getProviderDisplayName(provider) {
    const names = {
      shopify: 'Shopify',
      klaviyo: 'Klaviyo',
      kustomer: 'Kustomer',
      messenger: 'Facebook Messenger',
      twilio: 'WhatsApp (Twilio)',
      stripe: 'Stripe',
      openai: 'OpenAI'
    };
    return names[provider] || provider;
  }

  // ===================================================================
  // API CALL METHODS - Uses admin credentials + user identifiers
  // ===================================================================

  async makeRequest(provider, endpoint, options = {}, userIdentifier = null) {
    if (!this.isProviderConfigured(provider)) {
      throw new Error(`${provider} integration not configured by admin`);
    }

    // Build request using admin credentials
    const requestConfig = this.buildRequestConfig(provider, endpoint, options, userIdentifier);
    
    try {
      const response = await fetch(requestConfig.url, requestConfig.options);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${provider} API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Integration request failed for ${provider}:`, error);
      throw error;
    }
  }

  buildRequestConfig(provider, endpoint, options, userIdentifier) {
    const config = {
      url: '',
      options: {
        method: options.method || 'GET',
        headers: {},
        ...options
      }
    };

    switch (provider) {
      case 'shopify':
        config.url = `https://${userIdentifier}.myshopify.com/admin/api/2024-10${endpoint}`;
        config.options.headers = {
          'X-Shopify-Access-Token': this.credentials.shopify.accessToken,
          'Content-Type': 'application/json',
        };
        break;

      case 'klaviyo':
        config.url = `https://a.klaviyo.com/api${endpoint}`;
        config.options.headers = {
          'Authorization': `Klaviyo-API-Key ${this.credentials.klaviyo.privateKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-10-15',
        };
        break;

      case 'kustomer':
        config.url = `https://${userIdentifier}.api.kustomerapp.com/v1${endpoint}`;
        config.options.headers = {
          'Authorization': `Bearer ${this.credentials.kustomer.apiKey}`,
          'Content-Type': 'application/json',
        };
        break;

      case 'messenger':
        config.url = `https://graph.facebook.com/v18.0${endpoint}`;
        config.options.headers = {
          'Content-Type': 'application/json',
        };
        // Add access token to URL for messenger
        const separator = endpoint.includes('?') ? '&' : '?';
        config.url += `${separator}access_token=${this.credentials.messenger.pageAccessToken}`;
        break;

      case 'twilio':
        const authString = btoa(`${this.credentials.twilio.accountSid}:${this.credentials.twilio.authToken}`);
        config.url = `https://api.twilio.com/2010-04-01/Accounts/${this.credentials.twilio.accountSid}${endpoint}`;
        config.options.headers = {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        break;

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    return config;
  }
}

// Singleton instance
const integrationService = new IntegrationService();
export default integrationService;
