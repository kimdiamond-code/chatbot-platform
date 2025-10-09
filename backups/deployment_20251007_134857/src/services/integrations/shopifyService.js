/**
 * Unified Shopify Service for True Citrus
 * Connects to real store and provides all e-commerce functionality
 */

import { dbService } from '../databaseService';

class ShopifyService {
  constructor() {
    // Load from environment variables (fallback)
    this.storeName = import.meta.env.VITE_SHOPIFY_STORE_NAME || 'truecitrus2';
    this.accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;
    this.apiVersion = '2024-10';
    this.baseUrl = `https://${this.storeName}.myshopify.com/admin/api/${this.apiVersion}`;
    this.credentialsLoaded = false;
    
    // Cache to reduce API calls
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    console.log('🛍️ Shopify Service initialized for:', this.storeName);
    
    // Load credentials from database
    this.loadCredentials();
  }
  
  /**
   * Load Shopify credentials from database
   */
  async loadCredentials() {
    try {
      // Get integrations from Neon database
      const integrations = await dbService.getIntegrations('00000000-0000-0000-0000-000000000001');
      
      // Find connected Shopify integration
      const shopifyIntegration = integrations.find(integration => 
        integration.integration_id === 'shopify' && integration.status === 'connected'
      );

      if (shopifyIntegration && shopifyIntegration.credentials_encrypted) {
        try {
          const credentials = typeof shopifyIntegration.credentials_encrypted === 'string'
            ? JSON.parse(shopifyIntegration.credentials_encrypted)
            : shopifyIntegration.credentials_encrypted;
          
          if (credentials && credentials.connectionType === 'api') {
            this.storeName = credentials.shopDomain;
            this.accessToken = credentials.accessToken;
            this.baseUrl = `https://${this.storeName}.myshopify.com/admin/api/${this.apiVersion}`;
            this.credentialsLoaded = true;
            console.log('✅ Loaded Shopify credentials from database for:', this.storeName);
            return;
          }
        } catch (parseError) {
          console.log('⚠️ Could not parse credentials:', parseError.message);
        }
      }
      
      console.log('⚠️ No database credentials found, using environment variables');
    } catch (error) {
      console.log('⚠️ Could not load credentials from database:', error.message);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, method = 'GET', body = null) {
    // Wait for credentials to load if not already loaded
    if (!this.credentialsLoaded && !this.accessToken) {
      console.log('⏳ Waiting for credentials to load...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!this.accessToken) {
      console.error('❌ Shopify access token not configured');
      throw new Error('Shopify integration not configured. Please add credentials via Integrations page or .env file.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(`🌐 Shopify API: ${method} ${endpoint}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Shopify API request failed:', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`💾 Cache hit: ${key}`);
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ==================== CUSTOMER METHODS ====================

  /**
   * Find customer by email
   */
  async findCustomerByEmail(email) {
    const cacheKey = `customer_${email}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/customers/search.json?query=email:${encodeURIComponent(email)}`);
      const customer = data.customers && data.customers.length > 0 ? data.customers[0] : null;
      
      if (customer) {
        this.setCache(cacheKey, customer);
        console.log(`✅ Found customer: ${customer.email}`);
      } else {
        console.log(`⚠️ No customer found for: ${email}`);
      }
      
      return customer;
    } catch (error) {
      console.error('Error finding customer:', error);
      return null;
    }
  }

  /**
   * Get customer's order history
   */
  async getCustomerOrders(customerId, limit = 10) {
    try {
      const data = await this.makeRequest(`/customers/${customerId}/orders.json?limit=${limit}&status=any`);
      console.log(`✅ Found ${data.orders?.length || 0} orders for customer ${customerId}`);
      return data.orders || [];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  // ==================== ORDER METHODS ====================

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    const cacheKey = `order_${orderId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/orders/${orderId}.json`);
      this.setCache(cacheKey, data.order);
      return data.order;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  /**
   * Find order by order number (like #1001)
   */
  async findOrderByNumber(orderNumber) {
    try {
      // Remove # if present
      const cleanNumber = orderNumber.toString().replace('#', '');
      const data = await this.makeRequest(`/orders.json?name=%23${cleanNumber}&status=any&limit=1`);
      const order = data.orders && data.orders.length > 0 ? data.orders[0] : null;
      
      if (order) {
        console.log(`✅ Found order #${order.order_number}`);
      } else {
        console.log(`⚠️ No order found for: #${cleanNumber}`);
      }
      
      return order;
    } catch (error) {
      console.error('Error finding order:', error);
      return null;
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return null;

      const fulfillments = order.fulfillments || [];
      const tracking = fulfillments.map(f => ({
        status: f.shipment_status || 'pending',
        tracking_company: f.tracking_company,
        tracking_number: f.tracking_number,
        tracking_url: f.tracking_url,
        created_at: f.created_at,
        updated_at: f.updated_at
      }));

      return {
        order_id: order.id,
        order_number: order.order_number,
        order_name: order.name,
        fulfillment_status: order.fulfillment_status,
        financial_status: order.financial_status,
        tracking_info: tracking,
        items: order.line_items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          sku: item.sku,
          price: item.price
        })),
        total: order.total_price,
        currency: order.currency
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      return null;
    }
  }

  // ==================== PRODUCT METHODS ====================

  /**
   * Search products by query
   */
  async searchProducts(query, limit = 10) {
    const cacheKey = `product_search_${query}_${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/products.json?limit=${limit}&status=active&title=${encodeURIComponent(query)}`);
      
      // Additional client-side filtering for better matches
      let products = data.products || [];
      
      const queryLower = query.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(queryLower) ||
        product.body_html?.toLowerCase().includes(queryLower) ||
        product.tags?.toLowerCase().includes(queryLower) ||
        product.product_type?.toLowerCase().includes(queryLower)
      );

      this.setCache(cacheKey, products);
      console.log(`✅ Found ${products.length} products matching "${query}"`);
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    const cacheKey = `product_${productId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/products/${productId}.json`);
      this.setCache(cacheKey, data.product);
      return data.product;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Get all products (paginated)
   */
  async getProducts(limit = 50) {
    try {
      const data = await this.makeRequest(`/products.json?limit=${limit}&status=active`);
      return data.products || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Get product recommendations
   */
  async getProductRecommendations(productId, limit = 5) {
    try {
      const product = await this.getProduct(productId);
      if (!product) return [];

      // Get similar products by type or tags
      const allProducts = await this.getProducts(20);
      const similar = allProducts
        .filter(p => 
          p.id !== productId && 
          (p.product_type === product.product_type || 
           p.tags?.split(',').some(tag => product.tags?.includes(tag)))
        )
        .slice(0, limit);

      console.log(`✅ Found ${similar.length} recommendations for product ${productId}`);
      return similar;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // ==================== CHAT INTEGRATION ====================

  /**
   * Handle customer inquiry intelligently
   * Returns structured data for chat responses
   */
  async handleChatInquiry(message, customerEmail = null) {
    const messageLower = message.toLowerCase();
    
    console.log(`🤖 Processing inquiry: "${message}"`);
    
    // Order tracking inquiry
    if (messageLower.match(/order|track|shipping|delivery|status|where.*my/i)) {
      console.log('📦 Detected order tracking inquiry');
      
      // Try to find order number in message
      const orderMatch = message.match(/#?(\d{4,})/);
      if (orderMatch) {
        const orderNumber = orderMatch[1];
        const order = await this.findOrderByNumber(orderNumber);
        if (order) {
          const tracking = await this.getOrderTracking(order.id);
          return {
            type: 'order_tracking',
            data: order,
            trackingInfo: tracking,
            response: this.formatOrderResponse(order, tracking)
          };
        }
      }
      
      // Try to find by customer email
      if (customerEmail) {
        const customer = await this.findCustomerByEmail(customerEmail);
        if (customer) {
          const orders = await this.getCustomerOrders(customer.id, 3);
          if (orders.length > 0) {
            const latestOrder = orders[0];
            const tracking = await this.getOrderTracking(latestOrder.id);
            return {
              type: 'order_tracking',
              data: latestOrder,
              trackingInfo: tracking,
              response: this.formatOrderResponse(latestOrder, tracking)
            };
          }
        }
      }
    }

    // Product search inquiry
    if (messageLower.match(/product|item|buy|purchase|looking for|find|search/i)) {
      console.log('🔍 Detected product search inquiry');
      
      // Extract search terms (remove common words)
      const stopWords = ['product', 'item', 'buy', 'purchase', 'looking', 'for', 'find', 'search', 'where', 'can', 'i', 'the', 'a', 'an'];
      const words = messageLower.split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word));
      
      if (words.length > 0) {
        const searchTerm = words.join(' ');
        const products = await this.searchProducts(searchTerm, 5);
        if (products.length > 0) {
          return {
            type: 'product_search',
            data: products,
            response: this.formatProductSearchResponse(products, searchTerm)
          };
        }
      }
    }

    // Inventory/stock inquiry
    if (messageLower.match(/stock|available|in stock|inventory/i)) {
      console.log('📊 Detected inventory inquiry');
      
      const words = messageLower.split(' ')
        .filter(word => word.length > 3 && !['stock', 'available', 'inventory'].includes(word));
      
      if (words.length > 0) {
        const searchTerm = words.join(' ');
        const products = await this.searchProducts(searchTerm, 3);
        if (products.length > 0) {
          return {
            type: 'inventory_check',
            data: products,
            response: this.formatInventoryResponse(products)
          };
        }
      }
    }

    return null;
  }

  // ==================== RESPONSE FORMATTING ====================

  formatOrderResponse(order, trackingInfo = null) {
    const status = this.getOrderStatus(order);
    let response = `📦 **Order ${order.name}**\n`;
    response += `Status: ${status}\n`;
    response += `Total: ${this.formatPrice(order.total_price, order.currency)}\n`;
    response += `Date: ${this.formatDate(order.created_at)}\n\n`;

    // Add items
    response += `**Items:**\n`;
    order.line_items.slice(0, 3).forEach(item => {
      response += `• ${item.title} (×${item.quantity}) - ${this.formatPrice(item.price, order.currency)}\n`;
    });

    // Add tracking if available
    if (trackingInfo && trackingInfo.tracking_info && trackingInfo.tracking_info.length > 0) {
      response += `\n**Tracking:**\n`;
      trackingInfo.tracking_info.forEach(track => {
        if (track.tracking_number) {
          response += `• ${track.tracking_company || 'Carrier'}: ${track.tracking_number}\n`;
          if (track.tracking_url) {
            response += `  Track: ${track.tracking_url}\n`;
          }
        }
      });
    }

    return response;
  }

  formatProductSearchResponse(products, searchTerm) {
    let response = `🔍 Found ${products.length} products matching "${searchTerm}":\n\n`;
    
    products.slice(0, 5).forEach((product, index) => {
      const variant = product.variants?.[0];
      const price = variant ? this.formatPrice(variant.price) : 'Price on request';
      const inStock = variant && variant.inventory_quantity > 0;
      
      response += `${index + 1}. **${product.title}**\n`;
      response += `   ${price} ${inStock ? '✅ In stock' : '⚠️ Limited'}\n`;
      
      if (product.body_html) {
        const description = this.stripHtml(product.body_html).substring(0, 100);
        response += `   ${description}...\n`;
      }
      
      response += `   [View Product](https://${this.storeName}.myshopify.com/products/${product.handle})\n\n`;
    });

    return response;
  }

  formatInventoryResponse(products) {
    let response = `📊 **Stock Status:**\n\n`;
    
    products.forEach(product => {
      const variant = product.variants?.[0];
      const quantity = variant?.inventory_quantity || 0;
      const status = quantity > 10 ? '✅ In Stock' : quantity > 0 ? '⚠️ Low Stock' : '❌ Out of Stock';
      
      response += `• **${product.title}**\n`;
      response += `  ${status}`;
      if (quantity > 0) {
        response += ` (${quantity} available)`;
      }
      response += `\n\n`;
    });

    return response;
  }

  // ==================== UTILITY METHODS ====================

  getOrderStatus(order) {
    if (order.cancelled_at) return '❌ Cancelled';
    if (order.fulfillment_status === 'fulfilled') return '✅ Delivered';
    if (order.fulfillment_status === 'partial') return '📦 Partially Shipped';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return '⏳ Processing';
    if (order.financial_status === 'pending') return '⏰ Payment Pending';
    return '✅ Confirmed';
  }

  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(price));
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }

  /**
   * Health check - verify connection to Shopify
   */
  async verifyConnection() {
    try {
      console.log('🔍 Testing Shopify connection...');
      const data = await this.makeRequest('/shop.json');
      console.log('✅ Shopify connection successful!');
      return {
        connected: true,
        shop: data.shop.name,
        domain: data.shop.domain,
        email: data.shop.email,
        currency: data.shop.currency
      };
    } catch (error) {
      console.error('❌ Shopify connection failed:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const shopifyService = new ShopifyService();
export default shopifyService;

// Expose globally for testing
if (typeof window !== 'undefined') {
  window.shopifyService = shopifyService;
  console.log('🔧 shopifyService available globally as window.shopifyService');
}
