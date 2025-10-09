// Real Shopify Integration Service - Production Ready
class RealShopifyService {
  constructor() {
    this.config = this.loadConfig();
    this.baseUrl = null;
    this.headers = null;
    this.initializeConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('shopify_config');
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfig() {
    if (this.config && this.config.status === 'connected') {
      this.baseUrl = `https://${this.config.storeName}.myshopify.com/admin/api/2024-10`;
      this.headers = {
        'X-Shopify-Access-Token': this.config.apiKey,
        'Content-Type': 'application/json'
      };
    }
  }

  isConnected() {
    return this.config && this.config.status === 'connected' && this.config.apiKey && this.config.storeName;
  }

  // Test API connection
  async testConnection() {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        shop: data.shop,
        message: `Connected to ${data.shop.name}`
      };
    } catch (error) {
      console.error('Shopify connection test failed:', error);
      throw error;
    }
  }

  // Customer Methods
  async getCustomer(email) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/customers/search.json?query=email:${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.status}`);
      }

      const data = await response.json();
      return data.customers.length > 0 ? data.customers[0] : null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerId, limit = 10) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/customers/${customerId}/orders.json?limit=${limit}&status=any`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}.json`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch order: ${response.status}`);
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Product Methods
  async getProducts(limit = 50) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/products.json?limit=${limit}&status=active`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async searchProducts(query, limit = 20) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      // Search in product titles and descriptions
      const response = await fetch(
        `${this.baseUrl}/products.json?limit=${limit}&title=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status}`);
      }

      const data = await response.json();
      
      // Additional filtering on the client side for better matches
      const filteredProducts = data.products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.body_html?.toLowerCase().includes(query.toLowerCase()) ||
        product.tags?.toLowerCase().includes(query.toLowerCase())
      );

      return filteredProducts;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductById(productId) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}.json`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Inventory Methods
  async getInventoryLevels(inventoryItemIds) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const idsParam = Array.isArray(inventoryItemIds) 
        ? inventoryItemIds.join(',')
        : inventoryItemIds;

      const response = await fetch(
        `${this.baseUrl}/inventory_levels.json?inventory_item_ids=${idsParam}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
      }

      const data = await response.json();
      return data.inventory_levels || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  // Order Management Methods
  async getRecentOrders(limit = 50, status = 'open') {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/orders.json?limit=${limit}&status=${status}&created_at_min=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  // Abandoned Cart Methods (using Draft Orders as proxy)
  async getAbandonedCheckouts(limit = 50) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/checkouts.json?limit=${limit}&status=abandoned&created_at_min=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        // Fallback to draft orders if checkouts endpoint is not available
        return this.getDraftOrders(limit);
      }

      const data = await response.json();
      return data.checkouts || [];
    } catch (error) {
      console.error('Error fetching abandoned checkouts:', error);
      // Fallback to draft orders
      return this.getDraftOrders(limit);
    }
  }

  async getDraftOrders(limit = 50) {
    try {
      const response = await fetch(
        `${this.baseUrl}/draft_orders.json?limit=${limit}&status=open`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch draft orders: ${response.status}`);
      }

      const data = await response.json();
      return data.draft_orders || [];
    } catch (error) {
      console.error('Error fetching draft orders:', error);
      throw error;
    }
  }

  // Webhook Management Methods
  async getWebhooks() {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/webhooks.json`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch webhooks: ${response.status}`);
      }

      const data = await response.json();
      return data.webhooks || [];
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  }

  async createWebhook(topic, address, format = 'json') {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      const webhook = {
        webhook: {
          topic: topic,
          address: address,
          format: format
        }
      };

      const response = await fetch(`${this.baseUrl}/webhooks.json`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(webhook)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create webhook: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.webhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  }

  async setupWebhooks(baseUrl) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    const webhookTopics = [
      'orders/create',
      'orders/updated',
      'orders/paid',
      'orders/cancelled',
      'orders/fulfilled',
      'customers/create',
      'customers/update',
      'app/uninstalled'
    ];

    const results = [];

    for (const topic of webhookTopics) {
      try {
        const address = `${baseUrl}/webhooks/shopify/${topic.replace('/', '-')}`;
        const webhook = await this.createWebhook(topic, address);
        results.push({ topic, success: true, webhook });
      } catch (error) {
        results.push({ topic, success: false, error: error.message });
      }
    }

    return results;
  }

  // Customer Service Integration Methods
  async handleCustomerInquiry(message, customerEmail) {
    if (!this.isConnected()) {
      return null;
    }

    const inquiry = message.toLowerCase();
    
    try {
      // Order tracking inquiries
      if (inquiry.includes('order') && (inquiry.includes('track') || inquiry.includes('status') || inquiry.includes('where'))) {
        const customer = await this.getCustomer(customerEmail);
        if (customer) {
          const orders = await this.getCustomerOrders(customer.id, 5);
          if (orders.length > 0) {
            const recentOrders = orders.slice(0, 3);
            return {
              type: 'order_tracking',
              data: recentOrders,
              response: this.formatOrderStatusResponse(recentOrders)
            };
          }
        }
      }

      // Product search inquiries
      if (inquiry.includes('product') || inquiry.includes('item') || inquiry.includes('buy') || inquiry.includes('looking for')) {
        const searchTerms = this.extractSearchTerms(inquiry);
        if (searchTerms.length > 0) {
          const products = await this.searchProducts(searchTerms.join(' '), 5);
          if (products.length > 0) {
            return {
              type: 'product_search',
              data: products,
              response: this.formatProductSearchResponse(products, searchTerms.join(' '))
            };
          }
        }
      }

      // Inventory inquiries
      if (inquiry.includes('stock') || inquiry.includes('available') || inquiry.includes('in stock')) {
        const searchTerms = this.extractSearchTerms(inquiry);
        if (searchTerms.length > 0) {
          const products = await this.searchProducts(searchTerms.join(' '), 3);
          if (products.length > 0) {
            return {
              type: 'inventory_check',
              data: products,
              response: this.formatInventoryResponse(products)
            };
          }
        }
      }

    } catch (error) {
      console.error('Error handling customer inquiry:', error);
    }

    return null;
  }

  // Helper Methods
  extractSearchTerms(message) {
    const stopWords = ['product', 'item', 'buy', 'looking', 'for', 'where', 'is', 'are', 'can', 'i', 'find', 'stock', 'available'];
    return message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  formatOrderStatusResponse(orders) {
    if (orders.length === 1) {
      const order = orders[0];
      return `Your order #${order.name} (${this.formatPrice(order.total_price)}) is currently ${this.getOrderStatus(order)}. ${order.tracking_number ? `Tracking number: ${order.tracking_number}` : ''}`;
    }
    
    let response = `I found ${orders.length} recent orders:\n`;
    orders.forEach(order => {
      response += `• Order #${order.name}: ${this.getOrderStatus(order)} - ${this.formatPrice(order.total_price)}\n`;
    });
    
    return response;
  }

  formatProductSearchResponse(products, searchTerm) {
    if (products.length === 1) {
      const product = products[0];
      const variant = product.variants?.[0];
      return `I found "${product.title}" for ${variant ? this.formatPrice(variant.price) : 'pricing available on request'}. ${product.body_html ? this.stripHtml(product.body_html).substring(0, 150) + '...' : ''}`;
    }
    
    let response = `I found ${products.length} products matching "${searchTerm}":\n`;
    products.slice(0, 3).forEach(product => {
      const variant = product.variants?.[0];
      response += `• ${product.title} - ${variant ? this.formatPrice(variant.price) : 'Price on request'}\n`;
    });
    
    return response;
  }

  formatInventoryResponse(products) {
    let response = 'Here\'s the current stock status:\n';
    products.forEach(product => {
      const variant = product.variants?.[0];
      const stock = variant?.inventory_quantity || 0;
      const status = stock > 0 ? `${stock} in stock` : 'Out of stock';
      response += `• ${product.title}: ${status}\n`;
    });
    
    return response;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderStatus(order) {
    if (order.cancelled_at) return 'cancelled';
    if (order.fulfillment_status === 'fulfilled') return 'delivered';
    if (order.fulfillment_status === 'partial') return 'partially shipped';
    if (order.financial_status === 'pending') return 'payment pending';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'processing';
    return 'confirmed';
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Rate limiting and error handling
  async makeApiRequest(url, options = {}) {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers
          }
        });

        if (response.status === 429) {
          // Rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After') || '2';
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
          retries++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }
}

// Export singleton instance
export const realShopifyService = new RealShopifyService();
export default realShopifyService;