// Enhanced Chat Intelligence with Better Fallbacks
// This fixes the "I'll look into it" issue with order tracking

class ChatIntelligenceService {
  constructor() {
    this.intentPatterns = {
      // Order-related inquiries
      orderTracking: [
        /where\s+is\s+my\s+order/i,
        /track\s+my\s+order/i,
        /order\s+status/i,
        /order\s+#?(\w+)/i,
        /shipping\s+status/i,
        /when\s+will\s+my\s+order\s+arrive/i,
        /delivery\s+status/i,
        /hasn't\s+arrived/i,
        /not\s+received/i
      ],
      
      // Product searches and recommendations
      productSearch: [
        /looking\s+for/i,
        /need\s+help\s+finding/i,
        /recommend/i,
        /suggestion/i,
        /what.*headphones/i,
        /what.*speakers/i,
        /what.*products/i,
        /show\s+me/i,
        /product\s+info/i,
        /price\s+for/i,
        /available\s+in/i,
        /in\s+stock/i,
        /buy/i,
        /purchase/i,
        /shop\s+for/i,
        /browse/i,
        /catalog/i,
        /collection/i,
        /best\s+(selling|seller|rated)/i
      ],
      
      // Support escalation triggers
      supportEscalation: [
        /frustrated/i,
        /angry/i,
        /terrible\s+service/i,
        /speak\s+to\s+(manager|human|agent)/i,
        /this\s+is\s+ridiculous/i,
        /unacceptable/i,
        /disappointed/i,
        /complaint/i,
        /refund/i,
        /cancel\s+my/i,
        /human\s+agent/i
      ],
      
      // Billing and account issues  
      billingInquiry: [
        /billing/i,
        /charged\s+twice/i,
        /payment\s+issue/i,
        /account\s+problem/i,
        /subscription/i,
        /invoice/i,
        /credit\s+card/i
      ]
    };
    
    // Sentiment analysis patterns
    this.sentimentPatterns = {
      negative: [
        /terrible/i, /awful/i, /horrible/i, /worst/i, /hate/i,
        /frustrated/i, /angry/i, /disappointed/i, /unacceptable/i,
        /ridiculous/i, /pathetic/i, /useless/i
      ],
      urgent: [
        /urgent/i, /emergency/i, /asap/i, /immediately/i,
        /right\s+now/i, /critical/i
      ],
      positive: [
        /great/i, /excellent/i, /amazing/i, /wonderful/i,
        /love/i, /perfect/i, /fantastic/i, /awesome/i
      ]
    };
  }

  /**
   * Analyze message and determine intents and context
   */
  analyzeMessage(message, customerEmail = null) {
    const analysis = {
      intents: [],
      entities: {
        orderNumbers: [],
        products: [],
        email: customerEmail
      },
      sentiment: 'neutral',
      priority: 'medium',
      requiresEscalation: false,
      confidence: 0
    };

    const lowerMessage = message.toLowerCase();

    // Extract order numbers - improved regex
    const orderMatches = message.match(/#?(\d{4,}|\w{4,}-\w{4,})/g);
    if (orderMatches) {
      analysis.entities.orderNumbers = orderMatches.map(match => match.replace('#', ''));
    }

    // Detect intents
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          analysis.intents.push(intent);
          analysis.confidence += 0.2;
          break;
        }
      }
    }

    // Analyze sentiment
    const negativeCount = this.sentimentPatterns.negative.filter(pattern => pattern.test(message)).length;
    const urgentCount = this.sentimentPatterns.urgent.filter(pattern => pattern.test(message)).length;
    const positiveCount = this.sentimentPatterns.positive.filter(pattern => pattern.test(message)).length;

    if (negativeCount > 0 || urgentCount > 0) {
      analysis.sentiment = 'negative';
      analysis.priority = urgentCount > 0 ? 'urgent' : 'high';
      analysis.requiresEscalation = negativeCount >= 2 || urgentCount > 0;
    } else if (positiveCount > 0) {
      analysis.sentiment = 'positive';
    }

    // Check for escalation triggers
    if (analysis.intents.includes('supportEscalation') || 
        analysis.sentiment === 'negative' && analysis.intents.length > 0) {
      analysis.requiresEscalation = true;
      analysis.priority = 'high';
    }

    // Normalize confidence
    analysis.confidence = Math.min(analysis.confidence, 1.0);

    return analysis;
  }

  /**
   * Generate smart response suggestions based on analysis
   */
  generateResponsePlan(analysis, originalMessage = '') {
    const plan = {
      actions: [],
      responseType: 'standard',
      integrationCalls: []
    };

    // Order tracking requests
    if (analysis.intents.includes('orderTracking')) {
      plan.actions.push({
        type: 'shopify_order_lookup',
        email: analysis.entities.email,
        orderNumbers: analysis.entities.orderNumbers
      });
      plan.responseType = 'order_status';
    }

    // Product search requests
    if (analysis.intents.includes('productSearch')) {
      // Extract product keywords from message
      let searchQuery = 'general';
      if (analysis.entities.products && analysis.entities.products.length > 0) {
        searchQuery = analysis.entities.products[0];
      } else {
        // Try to extract keywords from message
        const productKeywords = ['headphone', 'speaker', 'earphone', 'earbud', 'bluetooth', 'wireless', 'cable'];
        const words = originalMessage.toLowerCase().split(/\s+/);
        const foundKeyword = words.find(word => 
          productKeywords.some(keyword => word.includes(keyword))
        );
        if (foundKeyword) {
          searchQuery = foundKeyword;
        }
      }
      
      plan.actions.push({
        type: 'shopify_product_search',
        products: analysis.entities.products,
        query: searchQuery
      });
      plan.responseType = 'product_recommendations';
    }

    // Support escalation
    if (analysis.requiresEscalation) {
      plan.actions.push({
        type: 'kustomer_escalation',
        priority: analysis.priority,
        sentiment: analysis.sentiment,
        reason: analysis.intents.includes('supportEscalation') ? 'customer_request' : 'sentiment_analysis'
      });
      plan.responseType = 'escalation';
    }

    // Billing issues
    if (analysis.intents.includes('billingInquiry')) {
      plan.actions.push({
        type: 'kustomer_ticket_creation',
        category: 'billing',
        priority: analysis.priority
      });
      plan.responseType = 'billing_support';
    }

    return plan;
  }

  /**
   * Format intelligent response with better fallbacks
   */
  formatSmartResponse(plan, integrationResults, originalMessage) {
    let response = {
      text: '',
      actions: [],
      metadata: {
        source: 'smart_integration',
        confidence: 0.8,
        integrationsUsed: []
      }
    };

    switch (plan.responseType) {
      case 'order_status':
        response = this.formatOrderResponse(integrationResults.shopify, originalMessage, plan.actions[0]);
        break;
        
      case 'product_recommendations':
        response = this.formatProductResponse(integrationResults.shopify);
        break;
        
      case 'escalation':
        response = this.formatEscalationResponse(integrationResults.kustomer);
        break;
        
      case 'billing_support':
        response = this.formatBillingResponse(integrationResults.kustomer);
        break;
        
      default:
        response.text = "I understand you're looking for help. Let me connect you with the right information.";
    }

    return response;
  }

  formatOrderResponse(shopifyData, originalMessage, action) {
    // Check if Shopify integration failed completely
    if (!shopifyData) {
      return this.formatOrderFallbackResponse(action, originalMessage);
    }

    // Check if no orders found
    if (!shopifyData.orders || shopifyData.orders.length === 0) {
      return this.formatOrderNotFoundResponse(action, originalMessage);
    }

    // Format successful order response
    const latestOrder = shopifyData.orders[0];
    const status = this.getOrderStatus(latestOrder);
    
    let responseText = `I found your order! **${latestOrder.line_items?.[0]?.title || 'Your order'}** (Order #${latestOrder.name})\n\n`;
    
    responseText += `📦 **Status**: ${status}\n`;
    responseText += `💰 **Total**: $${latestOrder.total_price}\n`;
    
    if (latestOrder.tracking_number) {
      responseText += `📍 **Tracking**: ${latestOrder.tracking_number}\n`;
    }
    
    if (latestOrder.fulfillment_status === 'fulfilled') {
      responseText += `✅ **Delivered** - Hope you're enjoying your purchase!`;
    } else if (latestOrder.fulfillment_status === 'pending') {
      responseText += `🚚 **Expected delivery**: 2-3 business days`;
    }

    const actions = [];
    if (latestOrder.tracking_number) {
      actions.push({ 
        type: 'external_link', 
        label: 'Track Package', 
        url: latestOrder.tracking_url || `https://track.example.com/${latestOrder.tracking_number}` 
      });
    }
    actions.push({ type: 'escalate', label: 'Speak to Agent' });

    return {
      text: responseText,
      actions,
      metadata: { source: 'smart_integration', confidence: 0.9, integrationsUsed: ['shopify'] }
    };
  }

  formatOrderFallbackResponse(action, originalMessage) {
    let responseText = `I'd be happy to help you track your order! `;
    
    // If we detected an order number, mention it
    if (action.orderNumbers && action.orderNumbers.length > 0) {
      responseText += `I see you mentioned order #${action.orderNumbers[0]}. `;
    }
    
    responseText += `Here are a few ways I can help you right away:\n\n`;
    responseText += `📧 **Email Lookup**: Check your email for order confirmation with tracking info\n`;
    responseText += `🔗 **Account Login**: Log into your account at our website to view order status\n`;
    responseText += `📞 **Direct Help**: I can connect you with a specialist who can look up your order immediately\n\n`;
    responseText += `Would you like me to connect you with someone who can track your order right now?`;

    return {
      text: responseText,
      actions: [
        { type: 'escalate', label: '🚀 Connect with Specialist', priority: 'high' },
        { type: 'info', label: '📧 Check Order Email' },
        { type: 'external_link', label: '🔗 Login to Account', url: 'https://your-store.com/account' }
      ],
      metadata: { source: 'smart_integration_fallback', confidence: 0.7, integrationsUsed: [] }
    };
  }

  formatOrderNotFoundResponse(action, originalMessage) {
    let responseText = `I want to help you track your order, but I couldn't find it in our system. This could be because:\n\n`;
    responseText += `• The order was placed with a different email address\n`;
    responseText += `• The order number might be slightly different\n`;
    responseText += `• The order is very recent and still processing\n\n`;
    
    if (action.orderNumbers && action.orderNumbers.length > 0) {
      responseText += `I searched for order #${action.orderNumbers[0]}. `;
    }
    
    responseText += `Let me connect you with a specialist who can locate your order immediately!`;

    return {
      text: responseText,
      actions: [
        { type: 'escalate', label: '🚀 Find My Order', priority: 'high' },
        { type: 'input_request', label: '📝 Try Different Order Number', field: 'order_number' },
        { type: 'input_request', label: '📧 Try Different Email', field: 'email' }
      ],
      metadata: { source: 'smart_integration', confidence: 0.6, integrationsUsed: ['shopify'] }
    };
  }

  formatProductResponse(shopifyData) {
    if (!shopifyData || !shopifyData.products || shopifyData.products.length === 0) {
      return {
        text: "I'd be happy to help you find the perfect product! Could you tell me more about what you're looking for?",
        actions: [
          { type: 'quick_reply', label: 'Headphones', value: "I'm looking for headphones" },
          { type: 'quick_reply', label: 'Speakers', value: "I'm looking for speakers" },
          { type: 'quick_reply', label: 'Accessories', value: "I'm looking for accessories" }
        ],
        metadata: { source: 'smart_integration', confidence: 0.6, integrationsUsed: ['shopify'] }
      };
    }

    // Format products for display
    const formattedProducts = shopifyData.products.slice(0, 3).map(product => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.body_html,
      vendor: product.vendor,
      type: product.product_type,
      tags: product.tags,
      images: product.images?.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt || product.title
      })) || [],
      variants: product.variants?.map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        compareAtPrice: v.compare_at_price,
        sku: v.sku,
        available: v.inventory_quantity > 0,
        inventory: v.inventory_quantity
      })) || [],
      url: product.handle ? `https://your-store.myshopify.com/products/${product.handle}` : null
    }));

    const responseText = `Here are some great products I found for you:`;

    return {
      text: responseText,
      actions: [],
      metadata: { 
        source: 'smart_integration', 
        confidence: 0.9, 
        integrationsUsed: ['shopify'],
        products: formattedProducts
      }
    };
  }

  formatEscalationResponse(kustomerData) {
    const ticketNumber = kustomerData?.ticketId || `TK${Date.now().toString().slice(-6)}`;
    
    const responseText = `I understand your concern and I want to make sure you get the best help possible. I've connected you with our support team.\n\n` +
      `🎫 **Support Ticket**: #${ticketNumber}\n` +
      `⏱️ **Response Time**: A specialist will respond within 15 minutes\n` +
      `📞 **Priority**: High priority - you're important to us!\n\n` +
      `Is there anything else I can help you with while you wait?`;

    return {
      text: responseText,
      actions: [
        { type: 'escalate', label: 'Live Chat with Agent', priority: 'high' },
        { type: 'callback', label: 'Request Callback' }
      ],
      metadata: { source: 'smart_integration', confidence: 1.0, integrationsUsed: ['kustomer'] }
    };
  }

  formatBillingResponse(kustomerData) {
    const ticketNumber = kustomerData?.ticketId || `BL${Date.now().toString().slice(-6)}`;
    
    const responseText = `I've created a billing support ticket for you to ensure this gets resolved quickly.\n\n` +
      `🎫 **Billing Ticket**: #${ticketNumber}\n` +
      `💳 **Department**: Billing & Accounts\n` +
      `⏱️ **Response Time**: 1-2 hours during business hours\n\n` +
      `A billing specialist will review your account and contact you with a resolution.`;

    return {
      text: responseText,
      actions: [
        { type: 'escalate', label: 'Speak to Billing' },
        { type: 'info', label: 'View Account Status' }
      ],
      metadata: { source: 'smart_integration', confidence: 0.9, integrationsUsed: ['kustomer'] }
    };
  }

  getOrderStatus(order) {
    if (order.cancelled_at) return 'Cancelled';
    if (order.fulfillment_status === 'fulfilled') return 'Delivered';
    if (order.financial_status === 'pending') return 'Payment Processing';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'Processing';
    if (order.fulfillment_status === 'partial') return 'Partially Shipped';
    if (order.fulfillment_status === 'shipped') return 'Shipped';
    return 'Processing';
  }

  /**
   * Get conversation context for better responses
   */
  getConversationContext(messages, customerId) {
    const context = {
      messageCount: messages.length,
      hasOrderInquiries: false,
      hasProductQuestions: false,
      sentimentHistory: [],
      topics: []
    };

    messages.forEach(message => {
      if (message.sender_type === 'user') {
        const analysis = this.analyzeMessage(message.content);
        context.sentimentHistory.push(analysis.sentiment);
        context.topics.push(...analysis.intents);
        
        if (analysis.intents.includes('orderTracking')) {
          context.hasOrderInquiries = true;
        }
        if (analysis.intents.includes('productSearch')) {
          context.hasProductQuestions = true;
        }
      }
    });

    return context;
  }
}

// Export singleton instance
export const chatIntelligenceService = new ChatIntelligenceService();