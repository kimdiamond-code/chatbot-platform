/**
 * Multi-Tenant Shopify Service
 * Each user connects to their own Shopify store
 */

import { supabase } from '../supabase';

class UserShopifyService {
  constructor(userId) {
    this.userId = userId;
    this.connection = null;
    this.baseUrl = null;
    this.headers = null;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load user's Shopify connection from database
   */
  async loadConnection() {
    try {
      console.log(`🔍 Loading Shopify connection for user: ${this.userId}`);
      
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.log('⚠️ No active Shopify connection found');
        return null;
      }

      this.connection = data;
      this.baseUrl = `https://${data.store_name}.myshopify.com/admin/api/${data.api_version}`;
      this.headers = {
        'X-Shopify-Access-Token': data.access_token,
        'Content-Type': 'application/json'
      };

      console.log(`✅ Shopify connection loaded: ${data.store_name}.myshopify.com`);
      return data;
    } catch (error) {
      console.error('❌ Error loading Shopify connection:', error);
      return null;
    }
  }

  /**
   * Save new Shopify connection for user
   */
  async saveConnection(connectionData) {
    try {
      console.log(`💾 Saving Shopify connection for user: ${this.userId}`);

      // First, deactivate any existing connections
      await supabase
        .from('shopify_connections')
        .update({ status: 'inactive' })
        .eq('user_id', this.userId)
        .eq('status', 'active');

      // Test the connection first
      const testService = new UserShopifyService(this.userId);
      testService.connection = {
        store_name: connectionData.storeName,
        access_token: connectionData.accessToken,
        api_version: '2024-10'
      };
      testService.baseUrl = `https://${connectionData.storeName}.myshopify.com/admin/api/2024-10`;
      testService.headers = {
        'X-Shopify-Access-Token': connectionData.accessToken,
        'Content-Type': 'application/json'
      };

      // Verify connection works
      const verifyResult = await testService.verifyConnection();
      if (!verifyResult.connected) {
        throw new Error(verifyResult.error || 'Connection test failed');
      }

      // Save to database
      const { data, error } = await supabase
        .from('shopify_connections')
        .insert({
          user_id: this.userId,
          store_name: connectionData.storeName,
          store_domain: `${connectionData.storeName}.myshopify.com`,
          access_token: connectionData.accessToken,
          api_key: connectionData.apiKey || null,
          api_secret: connectionData.apiSecret || null,
          status: 'active',
          shop_name: verifyResult.shop,
          shop_email: verifyResult.email,
          shop_currency: verifyResult.currency,
          last_verified_at: new Date().toISOString(),
          enable_order_tracking: connectionData.enableOrderTracking !== false,
          enable_product_search: connectionData.enableProductSearch !== false,
          enable_customer_sync: connectionData.enableCustomerSync !== false,
          enable_inventory_alerts: connectionData.enableInventoryAlerts || false
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Shopify connection saved successfully');
      
      // Load the new connection
      await this.loadConnection();
      
      return { success: true, connection: data };
    } catch (error) {
      console.error('❌ Error saving Shopify connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update existing connection
   */
  async updateConnection(updates) {
    try {
      if (!this.connection) {
        await this.loadConnection();
      }

      if (!this.connection) {
        throw new Error('No active connection to update');
      }

      const { data, error } = await supabase
        .from('shopify_connections')
        .update(updates)
        .eq('id', this.connection.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Connection updated successfully');
      await this.loadConnection();
      return { success: true, connection: data };
    } catch (error) {
      console.error('❌ Error updating connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect (deactivate) Shopify connection
   */
  async disconnect() {
    try {
      if (!this.connection) {
        await this.loadConnection();
      }

      if (!this.connection) {
        return { success: true, message: 'No active connection' };
      }

      const { error } = await supabase
        .from('shopify_connections')
        .update({ status: 'inactive' })
        .eq('id', this.connection.id);

      if (error) throw error;

      this.connection = null;
      this.baseUrl = null;
      this.headers = null;
      this.cache.clear();

      console.log('✅ Shopify disconnected successfully');
      return { success: true, message: 'Disconnected successfully' };
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user has active connection
   */
  async isConnected() {
    if (!this.connection) {
      await this.loadConnection();
    }
    return !!this.connection;
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    if (!this.connection) {
      await this.loadConnection();
    }

    if (!this.connection) {
      return {
        connected: false,
        message: 'No Shopify store connected'
      };
    }

    return {
      connected: true,
      storeName: this.connection.store_name,
      storeDomain: this.connection.store_domain,
      shopName: this.connection.shop_name,
      connectedAt: this.connection.connected_at,
      lastVerified: this.connection.last_verified_at
    };
  }

  // ==================== API METHODS ====================
  // All the same methods as the original service, but they check connection first

  async makeRequest(endpoint, method = 'GET', body = null) {
    if (!this.connection) {
      await this.loadConnection();
    }

    if (!this.connection) {
      throw new Error('Shopify not connected. Please connect your store first.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.headers
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(`🌐 Shopify API (${this.connection.store_name}): ${method} ${endpoint}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Update connection status if auth error
        if (response.status === 401 || response.status === 403) {
          await this.updateConnection({
            status: 'error',
            last_error: `Authentication failed: ${response.status}`
          });
        }
        
        throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Update last verified timestamp periodically
      if (Math.random() < 0.1) { // 10% of requests
        await this.updateConnection({
          last_verified_at: new Date().toISOString(),
          last_error: null
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ Shopify API request failed:', error);
      throw error;
    }
  }

  // Cache methods
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

  async findOrderByNumber(orderNumber) {
    try {
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

  async searchProducts(query, limit = 10) {
    const cacheKey = `product_search_${query}_${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/products.json?limit=${limit}&status=active&title=${encodeURIComponent(query)}`);
      
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

  async getProducts(limit = 50) {
    try {
      const data = await this.makeRequest(`/products.json?limit=${limit}&status=active`);
      return data.products || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProductRecommendations(productId, limit = 5) {
    try {
      const product = await this.getProduct(productId);
      if (!product) return [];

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

  async handleChatInquiry(message, customerEmail = null) {
    const messageLower = message.toLowerCase();
    
    console.log(`🤖 Processing inquiry: "${message}"`);
    
    // Order tracking inquiry
    if (messageLower.match(/order|track|shipping|delivery|status|where.*my/i)) {
      console.log('📦 Detected order tracking inquiry');
      
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

    // Inventory inquiry
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

    response += `**Items:**\n`;
    order.line_items.slice(0, 3).forEach(item => {
      response += `• ${item.title} (×${item.quantity}) - ${this.formatPrice(item.price, order.currency)}\n`;
    });

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
    if (!this.connection) return '';
    
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
      
      response += `   [View Product](https://${this.connection.store_name}.myshopify.com/products/${product.handle})\n\n`;
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

// Factory function to create service for current user
export const createUserShopifyService = async (userId) => {
  const service = new UserShopifyService(userId);
  await service.loadConnection();
  return service;
};

export default UserShopifyService;
