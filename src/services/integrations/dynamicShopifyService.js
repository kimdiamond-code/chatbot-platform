// Dynamic Shopify Integration Service - Works with any store
// Reads configuration from database or runtime configuration

import dbService from '../databaseService';

class DynamicShopifyService {
  constructor() {
    this.config = null;
    this.baseUrl = null;
    this.headers = null;
    this.isInitialized = false;
  }

  // Load configuration from database or runtime
  async loadConfiguration() {
    try {
      // First check for runtime configuration
      if (window.SHOPIFY_CONFIG) {
        this.config = window.SHOPIFY_CONFIG;
        this.initializeClient();
        console.log('✅ Shopify config loaded from runtime');
        return this.config;
      }

      // Load from database
      const integrations = await dbService.getIntegrations('00000000-0000-0000-0000-000000000001');
      const shopifyConfig = integrations?.find(i => i.integration_id === 'shopify');

      if (shopifyConfig && shopifyConfig.credentials && shopifyConfig.status === 'connected') {
        this.config = shopifyConfig.credentials;
        this.initializeClient();
        
        // Cache in runtime for better performance
        window.SHOPIFY_CONFIG = this.config;
        
        console.log('✅ Shopify config loaded from database:', {
          storeName: this.config.storeName,
          hasToken: !!this.config.accessToken
        });
        
        return this.config;
      } else {
        console.log('⚠️ No Shopify configuration found in database');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading Shopify configuration:', error);
      return null;
    }
  }

  // Initialize the client with loaded configuration
  initializeClient() {
    if (this.config && this.config.storeName && this.config.accessToken) {
      this.baseUrl = `https://${this.config.storeName}.myshopify.com/admin/api/2024-10`;
      this.headers = {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      };
      this.isInitialized = true;
      console.log('🔧 Shopify client initialized for store:', this.config.storeName);
    } else {
      this.isInitialized = false;
      console.log('⚠️ Cannot initialize Shopify client - missing configuration');
    }
  }

  // Check if service is properly configured and connected
  async isConnected() {
    if (!this.isInitialized) {
      await this.loadConfiguration();
    }
    return this.isInitialized;
  }

  // Test connection with current configuration
  async testConnection() {
    if (!await this.isConnected()) {
      return {
        success: false,
        message: 'Shopify not configured. Please set up your store connection.',
        needsSetup: true
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected to ${data.shop.name}`,
        data: {
          shopName: data.shop.name,
          domain: data.shop.domain,
          email: data.shop.email,
          currency: data.shop.currency
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  // Integration with chatbot service
  async processCustomerMessage(message, customerData = {}) {
    // Basic response for now - will be enhanced after database is fixed
    return {
      hasShopifyResponse: false,
      message: 'Shopify integration ready but database needs to be configured'
    };
  }

  // Get current configuration status
  getConfigurationStatus() {
    return {
      isConfigured: !!this.config,
      isInitialized: this.isInitialized,
      storeName: this.config?.storeName || null,
      hasAccessToken: !!this.config?.accessToken
    };
  }

  // Clear cached configuration (useful for testing)
  clearConfiguration() {
    this.config = null;
    this.baseUrl = null;
    this.headers = null;
    this.isInitialized = false;
    delete window.SHOPIFY_CONFIG;
    console.log('🔄 Shopify configuration cleared');
  }
}

// Export singleton instance
export const dynamicShopifyService = new DynamicShopifyService();
export default dynamicShopifyService;