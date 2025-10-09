/**
 * Production Shopify Service for True Citrus
 * Real API integration with error handling and caching
 */

class ProductionShopifyService {
  constructor() {
    this.storeName = import.meta.env.VITE_SHOPIFY_STORE_NAME;
    this.accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;
    this.apiVersion = '2024-10';
    this.baseUrl = `https://${this.storeName}.myshopify.com/admin/api/${this.apiVersion}`;
    
    // Simple cache to reduce API calls
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Helper: Make authenticated API request
  async makeRequest(endpoint, method = 'GET', body = null) {
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
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shopify API request failed:', error);
      throw error;
    }
  }

  // Helper: Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
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

  // ======================
  // CUSTOMER METHODS
  // ======================

  /**
   * Search for customer by email
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
      }
      
      return customer;
    } catch (error) {
      console.error('Error finding customer:', error);
      return null;
    }
  }

  /**
   * Get customer details by ID
   */
  async getCustomer(customerId) {
    const cacheKey = `customer_id_${customerId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/customers/${customerId}.json`);
      this.setCache(cacheKey, data.customer);
      return data.customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      return null;
    }
  }

  /**
   * Get customer's order history
   */
  async getCustomerOrders(customerId, limit = 10) {
    try {
      const data = await this.makeRequest(`/customers/${customerId}/orders.json?limit=${limit}&status=any`);
      return data.orders || [];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  // ======================
  // ORDER METHODS
  // ======================

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
   * Search orders by order number
   */
  async findOrderByNumber(orderNumber) {
    try {
      const data = await this.makeRequest(`/orders.json?name=${encodeURIComponent('#' + orderNumber)}&status=any`);
      return data.orders && data.orders.length > 0 ? data.orders[0] : null;
    } catch (error) {
      console.error('Error finding order:', error);
      return null;
    }
  }

  /**
   * Get fulfillment status and tracking
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
        tracking_numbers: f.tracking_numbers,
        created_at: f.created_at,
        updated_at: f.updated_at
      }));

      return {
        order_id: order.id,
        order_number: order.order_number,
        fulfillment_status: order.fulfillment_status,
        financial_status: order.financial_status,
        tracking_info: tracking,
        items: order.line_items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          sku: item.sku
        }))
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      return null;
    }
  }

  // ======================
  // PRODUCT METHODS
  // ======================

  /**
   * Get products with pagination
   */
  async getProducts(limit = 50, pageInfo = null) {
    try {
      let endpoint = `/products.json?limit=${limit}&status=active`;
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const data = await this.makeRequest(endpoint);
      return {
        products: data.products || [],
        pageInfo: this.extractPageInfo(data)
      };
    } catch (error) {
      console.error('Error getting products:', error);
      return { products: [], pageInfo: null };
    }
  }

  /**
   * Search products by title or SKU
   */
  async searchProducts(query) {
    const cacheKey = `product_search_${query}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/products.json?title=${encodeURIComponent(query)}&status=active`);
      const products = data.products || [];
      this.setCache(cacheKey, products);
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
   * Get product recommendations based on product ID
   */
  async getProductRecommendations(productId, limit = 5) {
    try {
      // Get the product to understand its type and tags
      const product = await this.getProduct(productId);
      if (!product) return [];

      // Search for similar products by type
      const allProducts = await this.getProducts(20);
      const similar = allProducts.products
        .filter(p => 
          p.id !== productId && 
          p.product_type === product.product_type
        )
        .slice(0, limit);

      return similar;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // ======================
  // INVENTORY METHODS
  // ======================

  /**
   * Check inventory for a variant
   */
  async checkInventory(variantId) {
    try {
      const data = await this.makeRequest(`/variants/${variantId}.json`);
      return {
        variant_id: variantId,
        available: data.variant.inventory_quantity,
        policy: data.variant.inventory_policy,
        in_stock: data.variant.inventory_quantity > 0
      };
    } catch (error) {
      console.error('Error checking inventory:', error);
      return null;
    }
  }

  // ======================
  // CART & CHECKOUT METHODS
  // ======================

  /**
   * Get abandoned checkouts
   */
  async getAbandonedCheckouts(limit = 10) {
    try {
      const data = await this.makeRequest(`/checkouts.json?limit=${limit}&status=open`);
      return data.checkouts || [];
    } catch (error) {
      console.error('Error getting abandoned checkouts:', error);
      return [];
    }
  }

  /**
   * Create draft order (for assisted sales)
   */
  async createDraftOrder(customerEmail, lineItems, note = '') {
    try {
      const draftOrder = {
        draft_order: {
          line_items: lineItems.map(item => ({
            variant_id: item.variantId,
            quantity: item.quantity
          })),
          customer: {
            email: customerEmail
          },
          note: note,
          use_customer_default_address: true
        }
      };

      const data = await this.makeRequest('/draft_orders.json', 'POST', draftOrder);
      return data.draft_order;
    } catch (error) {
      console.error('Error creating draft order:', error);
      return null;
    }
  }

  /**
   * Send invoice for draft order
   */
  async sendDraftOrderInvoice(draftOrderId, customMessage = '') {
    try {
      const invoice = {
        draft_order_invoice: {
          custom_message: customMessage
        }
      };

      await this.makeRequest(`/draft_orders/${draftOrderId}/send_invoice.json`, 'POST', invoice);
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return false;
    }
  }

  // ======================
  // DISCOUNT METHODS
  // ======================

  /**
   * Create discount code
   */
  async createDiscountCode(code, type = 'percentage', value, minAmount = 0) {
    try {
      const priceRule = {
        price_rule: {
          title: code,
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: type,
          value: type === 'percentage' ? `-${value}` : `-${value * 100}`,
          customer_selection: 'all',
          starts_at: new Date().toISOString(),
          prerequisite_subtotal_range: minAmount > 0 ? {
            greater_than_or_equal_to: minAmount.toString()
          } : null
        }
      };

      const priceRuleData = await this.makeRequest('/price_rules.json', 'POST', priceRule);
      
      // Create discount code
      const discountCode = {
        discount_code: {
          code: code
        }
      };

      const codeData = await this.makeRequest(
        `/price_rules/${priceRuleData.price_rule.id}/discount_codes.json`,
        'POST',
        discountCode
      );

      return codeData.discount_code;
    } catch (error) {
      console.error('Error creating discount code:', error);
      return null;
    }
  }

  // ======================
  // CHAT INTEGRATION HELPERS
  // ======================

  /**
   * Process customer inquiry and return relevant data
   */
  async handleChatInquiry(message, customerEmail = null) {
    const inquiry = message.toLowerCase();
    const results = {
      type: null,
      data: null,
      suggestions: []
    };

    // Order tracking inquiry
    if (inquiry.match(/order|track|shipping|delivery|status/i)) {
      if (customerEmail) {
        const customer = await this.findCustomerByEmail(customerEmail);
        if (customer) {
          const orders = await this.getCustomerOrders(customer.id, 3);
          if (orders.length > 0) {
            results.type = 'order_tracking';
            results.data = orders[0];
            
            const tracking = await this.getOrderTracking(orders[0].id);
            results.trackingInfo = tracking;
          }
        }
      }
      
      // Extract order number from message
      const orderMatch = inquiry.match(/#?(\d{4,})/);
      if (orderMatch) {
        const orderNumber = orderMatch[1];
        const order = await this.findOrderByNumber(orderNumber);
        if (order) {
          results.type = 'order_tracking';
          results.data = order;
          results.trackingInfo = await this.getOrderTracking(order.id);
        }
      }
    }

    // Product search inquiry
    if (inquiry.match(/product|item|buy|purchase|looking for/i)) {
      const words = inquiry.split(' ').filter(w => w.length > 3);
      const searchTerm = words[words.length - 1];
      
      if (searchTerm) {
        const products = await this.searchProducts(searchTerm);
        if (products.length > 0) {
          results.type = 'product_search';
          results.data = products.slice(0, 5);
        }
      }
    }

    // Return/refund inquiry
    if (inquiry.match(/return|refund|cancel/i)) {
      results.type = 'return_inquiry';
      results.suggestions = [
        'View return policy',
        'Start return process',
        'Contact support'
      ];
    }

    return results;
  }

  /**
   * Format product data for chat display
   */
  formatProductForChat(product) {
    const variant = product.variants[0];
    return {
      id: product.id,
      title: product.title,
      price: variant.price,
      comparePrice: variant.compare_at_price,
      image: product.images[0]?.src || null,
      url: `https://${this.storeName}.myshopify.com/products/${product.handle}`,
      inStock: variant.inventory_quantity > 0,
      sku: variant.sku
    };
  }

  /**
   * Format order data for chat display
   */
  formatOrderForChat(order, trackingInfo = null) {
    return {
      orderNumber: order.order_number,
      name: order.name,
      status: this.getOrderStatus(order),
      total: order.total_price,
      currency: order.currency,
      createdAt: order.created_at,
      items: order.line_items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      shipping: order.shipping_address,
      tracking: trackingInfo?.tracking_info || []
    };
  }

  // ======================
  // UTILITY METHODS
  // ======================

  getOrderStatus(order) {
    if (order.cancelled_at) return 'Cancelled';
    if (order.fulfillment_status === 'fulfilled') return 'Delivered';
    if (order.fulfillment_status === 'partial') return 'Partially Shipped';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'Processing';
    if (order.financial_status === 'pending') return 'Payment Pending';
    return 'Received';
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

  extractPageInfo(response) {
    // Extract pagination info from Link header if available
    return response.pageInfo || null;
  }

  /**
   * Health check - verify connection to Shopify
   */
  async verifyConnection() {
    try {
      const data = await this.makeRequest('/shop.json');
      return {
        connected: true,
        shop: data.shop.name,
        domain: data.shop.domain,
        email: data.shop.email
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const productionShopifyService = new ProductionShopifyService();
export default productionShopifyService;
