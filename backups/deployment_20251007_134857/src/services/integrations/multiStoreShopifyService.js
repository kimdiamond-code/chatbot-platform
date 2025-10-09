// Multi-Store Shopify Integration Service
// Handles multiple Shopify stores for different organizations

import { dbService } from '../databaseService';

class MultiStoreShopifyService {
  constructor() {
    this.storeConnections = new Map(); // Cache active store connections
    this.currentOrganization = null;
    this.isInitialized = false;
  }

  // Set current organization context
  setOrganization(organizationId) {
    this.currentOrganization = organizationId;
    console.log('🏢 Multi-store service set to organization:', organizationId);
  }

  // Load all store configurations for current organization
  async loadStoreConfigurations(organizationId = null) {
    const orgId = organizationId || this.currentOrganization || '00000000-0000-0000-0000-000000000001';
    
    try {
      console.log('📊 Loading store configurations for org:', orgId);
      
      // Get integrations from Neon database
      const integrations = await dbService.getIntegrations(orgId);
      
      // Filter for Shopify integrations that are connected
      const shopifyIntegrations = integrations.filter(integration => 
        integration.integration_id === 'shopify' && integration.status === 'connected'
      );

      // Cache all active store connections
      for (const integration of shopifyIntegrations || []) {
        try {
          const credentials = typeof integration.credentials_encrypted === 'string' 
            ? JSON.parse(integration.credentials_encrypted) 
            : integration.credentials_encrypted;
          
          const config = typeof integration.config === 'string'
            ? JSON.parse(integration.config)
            : integration.config;
          
          if (credentials && config?.store_identifier) {
            this.storeConnections.set(config.store_identifier, {
              id: integration.id,
              organizationId: orgId,
              storeName: config.store_identifier,
              credentials: credentials,
              config: config,
              lastSync: integration.last_sync
            });
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse integration data:', parseError);
        }
      }

      console.log('✅ Loaded', shopifyIntegrations?.length || 0, 'store configurations');
      return shopifyIntegrations || [];

    } catch (error) {
      console.error('❌ Error loading store configurations:', error);
      return [];
    }
  }

  // Get store configuration by store name or auto-detect
  async getStoreConfig(storeName = null, organizationId = null) {
    const orgId = organizationId || this.currentOrganization;
    
    // Load configurations if not cached
    if (this.storeConnections.size === 0) {
      await this.loadStoreConfigurations(orgId);
    }

    // If specific store requested
    if (storeName) {
      const config = this.storeConnections.get(storeName);
      if (config) {
        console.log('🏪 Using store config for:', storeName);
        return config;
      }
    }

    // Auto-detect primary store for organization
    if (orgId) {
      const storeConfigs = Array.from(this.storeConnections.values())
        .filter(config => config.organizationId === orgId);
      
      if (storeConfigs.length > 0) {
        const primaryStore = storeConfigs[0]; // Use first store as primary
        console.log('🏪 Using primary store:', primaryStore.storeName);
        return primaryStore;
      }
    }

    console.log('⚠️ No store configuration found');
    return null;
  }

  // Check if any stores are connected for organization
  async isConnected(organizationId = null) {
    const config = await this.getStoreConfig(null, organizationId);
    return !!config;
  }

  // Test connection for specific store
  async testStoreConnection(storeName, organizationId = null) {
    const config = await this.getStoreConfig(storeName, organizationId);
    
    if (!config || !config.credentials?.accessToken) {
      return {
        success: false,
        message: 'Store not configured or missing credentials',
        needsSetup: true
      };
    }

    try {
      const response = await fetch(`https://${config.storeName}.myshopify.com/admin/api/2024-10/shop.json`, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': config.credentials.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update last sync time
      await this.updateLastSync(config.id);
      
      return {
        success: true,
        message: `Connected to ${data.shop.name}`,
        store: config.storeName,
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
        message: `Connection failed: ${error.message}`,
        store: config.storeName
      };
    }
  }

  // Update last sync time for integration
  async updateLastSync(integrationId) {
    try {
      // Update using Neon database service
      const updatedIntegration = await dbService.upsertIntegration({
        id: integrationId,
        last_sync: new Date().toISOString(),
        status: 'connected'
      });
      console.log('✅ Updated last sync time');
    } catch (error) {
      console.error('Error updating sync time:', error);
    }
  }

  // Get customer by email from any connected store
  async getCustomer(email, preferredStore = null, organizationId = null) {
    const storeConfig = await this.getStoreConfig(preferredStore, organizationId);
    
    if (!storeConfig) {
      throw new Error('No Shopify store configured');
    }

    try {
      const response = await fetch(
        `https://${storeConfig.storeName}.myshopify.com/admin/api/2024-10/customers/search.json?query=email:${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': storeConfig.credentials.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.status}`);
      }

      const data = await response.json();
      const customer = data.customers.length > 0 ? data.customers[0] : null;
      
      if (customer) {
        customer._store = storeConfig.storeName;
        customer._organization = storeConfig.organizationId;
      }
      
      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Get order by ID from specific store or search all stores
  async getOrderById(orderId, preferredStore = null, organizationId = null) {
    // If preferred store specified, try that first
    if (preferredStore) {
      const storeConfig = await this.getStoreConfig(preferredStore, organizationId);
      if (storeConfig) {
        try {
          const order = await this.fetchOrderFromStore(orderId, storeConfig);
          if (order) return order;
        } catch (error) {
          console.log(`Order ${orderId} not found in store ${preferredStore}`);
        }
      }
    }

    // Search all connected stores for the organization
    const orgId = organizationId || this.currentOrganization;
    await this.loadStoreConfigurations(orgId);
    
    const storeConfigs = Array.from(this.storeConnections.values())
      .filter(config => config.organizationId === orgId);

    for (const storeConfig of storeConfigs) {
      try {
        const order = await this.fetchOrderFromStore(orderId, storeConfig);
        if (order) {
          console.log(`✅ Found order ${orderId} in store ${storeConfig.storeName}`);
          return order;
        }
      } catch (error) {
        console.log(`Order ${orderId} not found in store ${storeConfig.storeName}`);
      }
    }

    return null; // Order not found in any store
  }

  // Fetch order from specific store
  async fetchOrderFromStore(orderId, storeConfig) {
    const response = await fetch(
      `https://${storeConfig.storeName}.myshopify.com/admin/api/2024-10/orders/${orderId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': storeConfig.credentials.accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch order: ${response.status}`);
    }

    const data = await response.json();
    const order = data.order;
    
    if (order) {
      order._store = storeConfig.storeName;
      order._organization = storeConfig.organizationId;
    }
    
    return order;
  }

  // Get customer orders from their associated store
  async getCustomerOrders(customerId, limit = 10, preferredStore = null, organizationId = null) {
    const storeConfig = await this.getStoreConfig(preferredStore, organizationId);
    
    if (!storeConfig) {
      throw new Error('No Shopify store configured');
    }

    try {
      const response = await fetch(
        `https://${storeConfig.storeName}.myshopify.com/admin/api/2024-10/customers/${customerId}/orders.json?limit=${limit}&status=any`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': storeConfig.credentials.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      const orders = data.orders || [];
      
      // Add store metadata to orders
      orders.forEach(order => {
        order._store = storeConfig.storeName;
        order._organization = storeConfig.organizationId;
      });
      
      return orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  // Search products across preferred store
  async searchProducts(query, limit = 20, preferredStore = null, organizationId = null) {
    const storeConfig = await this.getStoreConfig(preferredStore, organizationId);
    
    if (!storeConfig) {
      throw new Error('No Shopify store configured');
    }

    try {
      const response = await fetch(
        `https://${storeConfig.storeName}.myshopify.com/admin/api/2024-10/products.json?limit=${limit}&title=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': storeConfig.credentials.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status}`);
      }

      const data = await response.json();
      const products = data.products || [];
      
      // Add store metadata and enhance results
      const enhancedProducts = products.map(product => ({
        ...product,
        _store: storeConfig.storeName,
        _organization: storeConfig.organizationId,
        relevanceScore: this.calculateRelevanceScore(product, query)
      }));
      
      // Sort by relevance
      return enhancedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Calculate product relevance score
  calculateRelevanceScore(product, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const title = product.title.toLowerCase();
    const description = (product.body_html || '').toLowerCase();
    const tags = (product.tags || '').toLowerCase();

    if (title.includes(queryLower)) score += 100;
    if (description.includes(queryLower)) score += 25;
    if (tags.includes(queryLower)) score += 25;

    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    for (const word of queryWords) {
      if (title.includes(word)) score += 10;
      if (description.includes(word)) score += 5;
      if (tags.includes(word)) score += 5;
    }

    return score;
  }

  // Smart customer inquiry handler with multi-store support
  async handleCustomerInquiry(message, customerEmail = null, organizationId = null, preferredStore = null) {
    const inquiry = message.toLowerCase();
    
    try {
      // Handle order tracking inquiries
      if (inquiry.includes('order') && (inquiry.includes('track') || inquiry.includes('status') || inquiry.includes('where'))) {
        // Extract order numbers from message
        const orderNumbers = message.match(/#?(\d{4,}|\w{4,}-\w{4,})/g) || [];
        
        if (orderNumbers.length > 0) {
          // Search for specific orders
          for (const orderNum of orderNumbers) {
            const cleanOrderNum = orderNum.replace('#', '');
            const order = await this.getOrderById(cleanOrderNum, preferredStore, organizationId);
            
            if (order) {
              return {
                type: 'order_tracking',
                data: [order],
                response: this.formatOrderStatusResponse([order]),
                store: order._store
              };
            }
          }
        }
        
        // If no specific order found, try customer lookup
        if (customerEmail) {
          const customer = await this.getCustomer(customerEmail, preferredStore, organizationId);
          if (customer) {
            const orders = await this.getCustomerOrders(customer.id, 3, customer._store, organizationId);
            if (orders.length > 0) {
              return {
                type: 'order_tracking',
                data: orders,
                response: this.formatOrderStatusResponse(orders),
                store: customer._store
              };
            }
          }
        }
        
        return {
          type: 'order_tracking',
          response: 'I\'d be happy to help you track your order! Could you please provide your order number or the email address you used for your purchase?'
        };
      }

      // Handle product search inquiries
      if (inquiry.includes('product') || inquiry.includes('item') || inquiry.includes('buy') || inquiry.includes('looking for')) {
        const searchTerms = this.extractSearchTerms(inquiry);
        if (searchTerms.length > 0) {
          const products = await this.searchProducts(searchTerms.join(' '), 5, preferredStore, organizationId);
          if (products.length > 0) {
            return {
              type: 'product_search',
              data: products,
              response: this.formatProductSearchResponse(products, searchTerms.join(' ')),
              store: products[0]._store
            };
          }
        }
        
        return {
          type: 'product_search',
          response: 'I\'d be happy to help you find the right product! Could you tell me more about what you\'re looking for?'
        };
      }

    } catch (error) {
      console.error('Error handling customer inquiry:', error);
    }

    return null; // No specific match found
  }

  // Extract search terms from message
  extractSearchTerms(message) {
    const stopWords = ['product', 'item', 'buy', 'looking', 'for', 'where', 'is', 'are', 'can', 'i', 'find', 'stock', 'available'];
    return message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  // Format order status response
  formatOrderStatusResponse(orders) {
    if (orders.length === 1) {
      const order = orders[0];
      return `I found your order! **${order.line_items?.[0]?.title || 'Your order'}** (Order #${order.name})\n\n📦 **Status**: ${this.getOrderStatus(order)}\n💰 **Total**: $${order.total_price}\n${order.tracking_number ? `📍 **Tracking**: ${order.tracking_number}\n` : ''}🏪 **Store**: ${order._store}`;
    }
    
    let response = `I found ${orders.length} recent orders:\n`;
    orders.forEach(order => {
      response += `• Order #${order.name}: ${this.getOrderStatus(order)} - $${order.total_price} (${order._store})\n`;
    });
    
    return response;
  }

  // Format product search response
  formatProductSearchResponse(products, searchTerm) {
    if (products.length === 1) {
      const product = products[0];
      const variant = product.variants?.[0];
      return `I found "${product.title}" for ${variant ? `$${variant.price}` : 'pricing available online'}. ${this.stripHtml(product.body_html || '').substring(0, 150)}...\n\n🏪 **Available at**: ${product._store}`;
    }
    
    let response = `I found ${products.length} products matching "${searchTerm}":\n\n`;
    products.slice(0, 3).forEach((product, index) => {
      const variant = product.variants?.[0];
      response += `${index + 1}. **${product.title}** - ${variant ? `$${variant.price}` : 'See pricing online'} (${product._store})\n`;
    });
    
    return response;
  }

  // Get order status
  getOrderStatus(order) {
    if (order.cancelled_at) return 'Cancelled';
    if (order.fulfillment_status === 'fulfilled') return 'Delivered';
    if (order.fulfillment_status === 'partial') return 'Partially Shipped';
    if (order.fulfillment_status === 'shipped') return 'Shipped';
    if (order.financial_status === 'pending') return 'Payment Processing';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'Processing';
    return 'Confirmed';
  }

  // Strip HTML tags
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Integration with chatbot service
  async processCustomerMessage(message, customerData = {}, organizationId = null) {
    const inquiry = await this.handleCustomerInquiry(
      message, 
      customerData.email, 
      organizationId || this.currentOrganization,
      customerData.preferredStore
    );
    
    if (inquiry) {
      return {
        hasShopifyResponse: true,
        response: inquiry.response,
        type: inquiry.type,
        data: inquiry.data,
        store: inquiry.store,
        confidence: inquiry.confidence || 0.8
      };
    }
    
    return {
      hasShopifyResponse: false,
      message: 'No specific Shopify response found'
    };
  }

  // Get all connected stores for organization
  async getConnectedStores(organizationId = null) {
    const orgId = organizationId || this.currentOrganization;
    await this.loadStoreConfigurations(orgId);
    
    return Array.from(this.storeConnections.values())
      .filter(config => config.organizationId === orgId)
      .map(config => ({
        storeName: config.storeName,
        lastSync: config.lastSync,
        hasCredentials: !!config.credentials?.accessToken
      }));
  }

  // Clear cached configurations
  clearCache() {
    this.storeConnections.clear();
    console.log('🔄 Multi-store cache cleared');
  }

  // Get configuration status for organization
  getConfigurationStatus(organizationId = null) {
    const orgId = organizationId || this.currentOrganization;
    const orgStores = Array.from(this.storeConnections.values())
      .filter(config => config.organizationId === orgId);
    
    return {
      isConfigured: orgStores.length > 0,
      connectedStores: orgStores.length,
      stores: orgStores.map(config => ({
        storeName: config.storeName,
        hasCredentials: !!config.credentials?.accessToken,
        lastSync: config.lastSync
      }))
    };
  }
}

// Export singleton instance
export const multiStoreShopifyService = new MultiStoreShopifyService();
export default multiStoreShopifyService;