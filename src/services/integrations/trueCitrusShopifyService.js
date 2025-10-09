// True Citrus Shopify Integration Service - Production Ready
// Specialized for True Citrus products and customer needs

class TrueCitrusShopifyService {
  constructor() {
    this.config = {
      storeName: import.meta.env.VITE_SHOPIFY_STORE_NAME || 'true-citrus',
      accessToken: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
      apiSecret: import.meta.env.VITE_SHOPIFY_API_SECRET
    };
    
    this.baseUrl = `https://${this.config.storeName}.myshopify.com/admin/api/2024-10`;
    this.headers = this.config.accessToken ? {
      'X-Shopify-Access-Token': this.config.accessToken,
      'Content-Type': 'application/json'
    } : null;

    // True Citrus specific product categories
    this.productCategories = {
      'crystal-light-packets': {
        name: 'Crystal Light Packets',
        keywords: ['crystal light', 'packet', 'drink mix', 'flavor enhancer'],
        benefits: ['zero calories', 'vegan', 'gluten-free']
      },
      'true-lemon': {
        name: 'True Lemon',
        keywords: ['true lemon', 'lemon', 'citrus', 'natural'],
        benefits: ['natural', 'vegan', 'non-GMO', 'gluten-free']
      },
      'true-lime': {
        name: 'True Lime',
        keywords: ['true lime', 'lime', 'citrus', 'natural'],
        benefits: ['natural', 'vegan', 'non-GMO', 'gluten-free']
      },
      'true-orange': {
        name: 'True Orange',
        keywords: ['true orange', 'orange', 'citrus', 'natural'],
        benefits: ['natural', 'vegan', 'non-GMO', 'gluten-free']
      },
      'hydration': {
        name: 'Hydration Products',
        keywords: ['hydration', 'electrolyte', 'sports drink', 'wellness'],
        benefits: ['electrolytes', 'vitamins', 'natural flavors']
      }
    };

    this.commonQuestions = {
      vegan: ['vegan', 'plant-based', 'vegetarian', 'animal products'],
      ingredients: ['ingredients', 'what\'s in', 'contains', 'allergens'],
      nutrition: ['calories', 'sugar', 'carbs', 'nutrition facts'],
      usage: ['how to use', 'directions', 'mix', 'prepare'],
      shipping: ['shipping', 'delivery', 'when will', 'tracking'],
      benefits: ['benefits', 'good for', 'healthy', 'why choose']
    };
  }

  isConnected() {
    return !!(this.config.accessToken && this.config.storeName);
  }

  // Test connection with Shopify
  async testConnection() {
    if (!this.isConnected()) {
      return {
        success: false,
        message: 'Missing Shopify access token. Please configure in .env file.',
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

  // Enhanced product search with True Citrus specific logic
  async searchProducts(query, limit = 20) {
    if (!this.isConnected()) {
      throw new Error('Shopify integration not configured');
    }

    try {
      // First try direct product search
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
      
      // Enhanced filtering with True Citrus product knowledge
      const filteredProducts = this.enhanceProductResults(data.products, query);
      
      return filteredProducts;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Enhanced product filtering with True Citrus knowledge
  enhanceProductResults(products, query) {
    const lowerQuery = query.toLowerCase();
    
    return products
      .map(product => ({
        ...product,
        relevanceScore: this.calculateRelevanceScore(product, lowerQuery),
        trueCitrusCategory: this.identifyProductCategory(product),
        benefits: this.getProductBenefits(product)
      }))
      .filter(product => product.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  calculateRelevanceScore(product, query) {
    let score = 0;
    const title = product.title.toLowerCase();
    const description = (product.body_html || '').toLowerCase();
    const tags = (product.tags || '').toLowerCase();

    // Exact title match
    if (title.includes(query)) score += 100;
    
    // Check against True Citrus categories
    for (const [key, category] of Object.entries(this.productCategories)) {
      if (category.keywords.some(keyword => 
        query.includes(keyword) && (title.includes(keyword) || tags.includes(keyword))
      )) {
        score += 50;
      }
    }

    // Description match
    if (description.includes(query)) score += 25;
    
    // Tags match
    if (tags.includes(query)) score += 25;

    return score;
  }

  identifyProductCategory(product) {
    const title = product.title.toLowerCase();
    const tags = (product.tags || '').toLowerCase();
    
    for (const [key, category] of Object.entries(this.productCategories)) {
      if (category.keywords.some(keyword => 
        title.includes(keyword) || tags.includes(keyword)
      )) {
        return category;
      }
    }
    
    return null;
  }

  getProductBenefits(product) {
    const category = this.identifyProductCategory(product);
    return category ? category.benefits : ['natural ingredients', 'great taste'];
  }

  // True Citrus specific customer inquiry handler
  async handleCustomerInquiry(message, customerEmail = null) {
    if (!this.isConnected()) {
      return {
        type: 'no_connection',
        response: 'Shopify integration is not configured. Please check your connection settings.'
      };
    }

    const inquiry = message.toLowerCase();
    
    try {
      // Handle vegan-related questions
      if (this.matchesQuestionType(inquiry, 'vegan')) {
        return {
          type: 'product_info',
          category: 'vegan',
          response: 'Yes! All True Citrus products are vegan-friendly. Our products are made with simple and natural ingredients, contain no animal products, and are perfect for plant-based lifestyles. This includes our True Lemon, True Lime, True Orange packets, and Crystal Light drink mixes.',
          confidence: 0.95
        };
      }

      // Handle ingredient questions
      if (this.matchesQuestionType(inquiry, 'ingredients')) {
        const searchTerms = this.extractProductTerms(inquiry);
        if (searchTerms.length > 0) {
          const products = await this.searchProducts(searchTerms.join(' '), 3);
          if (products.length > 0) {
            return {
              type: 'ingredient_info',
              data: products,
              response: this.formatIngredientResponse(products[0])
            };
          }
        }
        return {
          type: 'ingredient_info',
          response: 'Our True Citrus products contain simple, natural ingredients. Most of our packets contain crystallized citrus, natural flavors, and are free from artificial preservatives. For specific ingredient lists, please check the product packaging or let me know which specific product you\'re asking about!'
        };
      }

      // Handle nutrition questions
      if (this.matchesQuestionType(inquiry, 'nutrition')) {
        return {
          type: 'nutrition_info',
          response: 'True Citrus products are designed to be healthy alternatives! Our True Lemon, Lime, and Orange packets have 0 calories, 0 sugar, and 0 carbs. Crystal Light products are also typically very low in calories (usually 5-10 calories per packet). All products are gluten-free and made with natural flavors.',
          confidence: 0.9
        };
      }

      // Handle usage/preparation questions
      if (this.matchesQuestionType(inquiry, 'usage')) {
        return {
          type: 'usage_info',
          response: 'It\'s easy to use True Citrus products! Simply add one packet to 16-20 oz of water, stir well, and enjoy. You can adjust the amount of water to taste - some people prefer stronger or milder flavors. Our packets are perfect for water bottles, travel, and on-the-go hydration.',
          confidence: 0.9
        };
      }

      // Handle order tracking
      if (inquiry.includes('order') && (inquiry.includes('track') || inquiry.includes('status') || inquiry.includes('where'))) {
        if (customerEmail) {
          const customer = await this.getCustomer(customerEmail);
          if (customer) {
            const orders = await this.getCustomerOrders(customer.id, 3);
            if (orders.length > 0) {
              return {
                type: 'order_tracking',
                data: orders,
                response: this.formatOrderStatusResponse(orders)
              };
            }
          }
        }
        return {
          type: 'order_tracking',
          response: 'I\'d be happy to help you track your order! Could you please provide your email address or order number? You can also check your order status by logging into your account on our website.'
        };
      }

      // Handle product search
      if (inquiry.includes('product') || inquiry.includes('buy') || inquiry.includes('looking for')) {
        const searchTerms = this.extractProductTerms(inquiry);
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

      // Handle shipping questions
      if (this.matchesQuestionType(inquiry, 'shipping')) {
        return {
          type: 'shipping_info',
          response: 'We offer fast and reliable shipping! Standard shipping typically takes 3-7 business days within the US. We also offer expedited shipping options. Orders over $35 qualify for free standard shipping. You\'ll receive tracking information via email once your order ships.',
          confidence: 0.9
        };
      }

      // Handle benefits questions
      if (this.matchesQuestionType(inquiry, 'benefits')) {
        return {
          type: 'benefits_info',
          response: 'True Citrus products offer many benefits: they\'re a healthy way to add natural citrus flavor to water, help with hydration, contain real fruit ingredients, are zero calories, vegan-friendly, gluten-free, and contain no artificial preservatives. Perfect for anyone looking to drink more water with great taste!',
          confidence: 0.9
        };
      }

    } catch (error) {
      console.error('Error handling customer inquiry:', error);
      return {
        type: 'error',
        response: 'I\'m having trouble accessing our product information right now. Please try again in a moment, or contact our customer service team directly for immediate assistance.'
      };
    }

    return null; // No specific match found
  }

  matchesQuestionType(inquiry, type) {
    const keywords = this.commonQuestions[type] || [];
    return keywords.some(keyword => inquiry.includes(keyword));
  }

  extractProductTerms(message) {
    const stopWords = ['product', 'item', 'buy', 'looking', 'for', 'where', 'is', 'are', 'can', 'i', 'find', 'about', 'the'];
    return message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter(word => 
        Object.values(this.productCategories).some(category =>
          category.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))
        ) || ['citrus', 'lemon', 'lime', 'orange', 'crystal', 'light', 'packet', 'drink'].includes(word)
      );
  }

  // Shopify API methods (from existing service)
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

  // Response formatting methods
  formatIngredientResponse(product) {
    const category = this.identifyProductCategory(product);
    const benefits = this.getProductBenefits(product);
    
    return `${product.title} contains natural ingredients and is ${benefits.join(', ')}. For the complete ingredient list, please check the product packaging. All True Citrus products are made with real fruit and natural flavors!`;
  }

  formatProductSearchResponse(products, searchTerm) {
    if (products.length === 1) {
      const product = products[0];
      const variant = product.variants?.[0];
      const benefits = product.benefits || this.getProductBenefits(product);
      
      return `I found "${product.title}" for ${variant ? this.formatPrice(variant.price) : 'pricing available online'}. This product is ${benefits.join(', ')}. ${this.getProductDescription(product)}`;
    }
    
    let response = `I found ${products.length} products matching "${searchTerm}":\n\n`;
    products.slice(0, 3).forEach((product, index) => {
      const variant = product.variants?.[0];
      const benefits = product.benefits || this.getProductBenefits(product);
      response += `${index + 1}. **${product.title}** - ${variant ? this.formatPrice(variant.price) : 'See pricing online'}\n   ${benefits.join(', ')}\n\n`;
    });
    
    return response;
  }

  formatOrderStatusResponse(orders) {
    if (orders.length === 1) {
      const order = orders[0];
      return `Your order #${order.name} (${this.formatPrice(order.total_price)}) is currently ${this.getOrderStatus(order)}. ${order.tracking_number ? `Tracking: ${order.tracking_number}` : 'You\'ll receive tracking info when it ships.'}`;
    }
    
    let response = `Here are your ${orders.length} most recent orders:\n\n`;
    orders.forEach((order, index) => {
      response += `${index + 1}. Order #${order.name}: ${this.getOrderStatus(order)} - ${this.formatPrice(order.total_price)}\n`;
    });
    
    return response;
  }

  getProductDescription(product) {
    const category = this.identifyProductCategory(product);
    if (category) {
      return `Perfect for adding natural ${category.name.toLowerCase()} flavor to water and beverages!`;
    }
    return 'A great way to enhance your beverages naturally!';
  }

  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(price));
  }

  getOrderStatus(order) {
    if (order.cancelled_at) return 'cancelled';
    if (order.fulfillment_status === 'fulfilled') return 'delivered';
    if (order.fulfillment_status === 'partial') return 'partially shipped';
    if (order.fulfillment_status === 'shipped') return 'shipped';
    if (order.financial_status === 'pending') return 'payment pending';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'processing';
    return 'confirmed';
  }

  // Integration with chatbot service
  async processCustomerMessage(message, customerData = {}) {
    const inquiry = await this.handleCustomerInquiry(message, customerData.email);
    
    if (inquiry) {
      return {
        hasShopifyResponse: true,
        response: inquiry.response,
        type: inquiry.type,
        data: inquiry.data,
        confidence: inquiry.confidence || 0.8
      };
    }
    
    return {
      hasShopifyResponse: false,
      message: 'No specific Shopify response found'
    };
  }
}

// Export singleton instance
export const trueCitrusShopifyService = new TrueCitrusShopifyService();
export default trueCitrusShopifyService;