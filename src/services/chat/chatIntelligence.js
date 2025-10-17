// Enhanced Chat Intelligence with Better Fallbacks
// This fixes the "I'll look into it" issue with order tracking

class ChatIntelligenceService {
  constructor() {
    // Store conversation context for follow-up handling
    this.conversationContext = new Map();
    
    this.intentPatterns = {
      // Order-related inquiries
      orderTracking: [
        /where\s+is\s+my\s+order/i,
        /track\s+my\s+order/i,
        /track\s+order/i,
        /order\s+status/i,
        /order\s+#?(\w+)/i,
        /shipping\s+status/i,
        /when\s+will\s+my\s+order\s+arrive/i,
        /delivery\s+status/i,
        /hasn't\s+arrived/i,
        /not\s+received/i,
        /track/i,  // Simple "track" keyword
        /order/i,  // Simple "order" keyword
        // FOLLOW-UP RESPONSES for order tracking
        /my\s+email\s+(is|:)/i,
        /email\s+(is|:)/i,
        /it's\s+[a-zA-Z0-9._%+-]+@/i,  // "it's john@example.com"
        /here\s+(is|it|:)/i,  // "here is my email"
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i  // Just an email address
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
        /show\s+(me\s+)?(some\s+)?products/i,
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
        /best\s+(selling|seller|rated)/i,
        /^(show|display|list|get)\s+(all\s+)?(the\s+)?products?$/i,
        /^products?$/i
      ],
      
      // Cart-related queries
      cartInquiry: [
        /show\s+(me\s+)?(my\s+)?cart/i,
        /what's\s+in\s+my\s+cart/i,
        /view\s+cart/i,
        /cart\s+items/i,
        /shopping\s+cart/i,
        /my\s+cart/i,
        /checkout/i,
        /items\s+in\s+cart/i,
        /cart/i  // Simple "cart" keyword
      ],
      
      // Product detail questions
      productQuestion: [
        /tell\s+me\s+about/i,
        /more\s+info(rmation)?\s+about/i,
        /details\s+(about|on|for)/i,
        /what\s+is\s+this/i,
        /describe\s+this/i,
        /specs\s+(for|on)/i,
        /specifications/i,
        /features\s+of/i,
        /reviews\s+(for|of)/i,
        /how\s+(much|does).*cost/i,
        /price\s+of/i
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
   * Store context for a conversation (for follow-ups)
   * Maintains full conversation memory until 8 minutes of inactivity
   */
  setConversationContext(conversationId, context) {
    if (!conversationId) return;
    
    // Get existing context to preserve accumulated data
    const existing = this.conversationContext.get(conversationId) || {};
    
    this.conversationContext.set(conversationId, {
      ...existing,
      ...context,
      timestamp: Date.now(),  // Reset idle timer on every update
      messageCount: (existing.messageCount || 0) + 1
    });
    
    console.log('💾 Updated conversation context:', {
      conversationId,
      messageCount: this.conversationContext.get(conversationId).messageCount,
      hasEmail: !!this.conversationContext.get(conversationId).collectedData?.email
    });
    
    // Clean old contexts (>8 minutes of inactivity)
    const eightMinutesAgo = Date.now() - (8 * 60 * 1000);
    for (const [id, ctx] of this.conversationContext.entries()) {
      if (ctx.timestamp < eightMinutesAgo) {
        console.log('🧹 Cleaning expired context for conversation:', id);
        this.conversationContext.delete(id);
      }
    }
  }
  
  /**
   * Get stored context for a conversation
   */
  getConversationContext(conversationId) {
    if (!conversationId) return null;
    
    const context = this.conversationContext.get(conversationId) || null;
    
    if (context) {
      // Check if expired (8 minutes)
      const eightMinutesAgo = Date.now() - (8 * 60 * 1000);
      if (context.timestamp < eightMinutesAgo) {
        console.log('⏰ Context expired for conversation:', conversationId);
        this.conversationContext.delete(conversationId);
        return null;
      }
      
      console.log('📋 Retrieved context:', {
        conversationId,
        activeIntent: context.activeIntent,
        waitingFor: context.waitingFor,
        messageCount: context.messageCount
      });
    }
    
    return context;
  }

  /**
   * Analyze message and determine intents and context
   * Uses AI-powered intent detection when OpenAI is available
   */
  async analyzeMessage(message, customerEmail = null, conversationId = null) {
    console.log('🔍 Starting message analysis:', message.substring(0, 50));
    
    // Check if we have previous context for this conversation
    const previousContext = this.getConversationContext(conversationId);
    if (previousContext) {
      console.log('📋 Found previous context:', previousContext.waitingFor);
    }
    
    // ALWAYS run regex analysis first as a baseline
    const regexAnalysis = this.analyzeMessageWithRegex(message, customerEmail);
    console.log('📊 Regex analysis result:', {
      intents: regexAnalysis.intents,
      confidence: regexAnalysis.confidence,
      email: regexAnalysis.entities.email,
      orderNumbers: regexAnalysis.entities.orderNumbers
    });
    
    // If we're waiting for specific info in a previous context, inherit that intent
    if (previousContext && previousContext.waitingFor && regexAnalysis.intents.length === 0) {
      console.log('⚡ No intent detected - using previous context:', previousContext.activeIntent);
      regexAnalysis.intents.push(previousContext.activeIntent);
      regexAnalysis.confidence = 0.85;
    }
    
    // Try AI-powered intent detection to enhance
    const aiIntents = await this.detectIntentsWithAI(message);
    
    if (aiIntents && aiIntents.length > 0) {
      console.log('🤖 AI detected additional intents:', aiIntents);
      // Merge AI intents with regex intents (keep unique)
      const mergedIntents = [...new Set([...regexAnalysis.intents, ...aiIntents])];
      regexAnalysis.intents = mergedIntents;
      regexAnalysis.confidence = Math.min(regexAnalysis.confidence + 0.2, 1.0);
      console.log('✅ Final merged intents:', mergedIntents);
    }
    
    return regexAnalysis;
  }
  
  /**
   * Detect intents using OpenAI via backend proxy
   */
  async detectIntentsWithAI(message) {
    try {
      const intentPrompt = `Analyze this customer message and identify the intents. Return ONLY a JSON array of intent names from this list:
- orderTracking: customer asking about order status, tracking, delivery
- productSearch: customer looking for products, recommendations, browsing
- productQuestion: asking details about a specific product
- cartInquiry: asking about cart, checkout
- supportEscalation: frustrated, wants human agent
- billingInquiry: billing, payment, refund questions

Customer message: "${message}"

Return format: ["intent1", "intent2"] or [] if no clear intent.
RESPOND ONLY WITH THE JSON ARRAY, NO OTHER TEXT.`;
      
      // Call OpenAI via backend proxy
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'openai',
          action: 'chat',
          messages: [{ role: 'user', content: intentPrompt }],
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 50
        })
      });

      if (!response.ok) {
        console.log('⚠️ AI intent detection API failed:', response.status);
        return null;
      }

      const result = await response.json();
      const responseText = result.data?.choices?.[0]?.message?.content?.trim();
      
      if (!responseText) {
        console.log('⚠️ No response from AI intent detection');
        return null;
      }

      // Try to parse the JSON array
      try {
        const intents = JSON.parse(responseText);
        return Array.isArray(intents) ? intents : null;
      } catch (parseError) {
        console.log('⚠️ Failed to parse AI intents:', responseText);
        return null;
      }
      
    } catch (error) {
      console.log('⚠️ AI intent detection failed:', error.message);
      return null;
    }
  }
  
  /**
   * Build analysis object from AI-detected intents
   */
  buildAnalysisFromAI(intents, message, customerEmail) {
    const analysis = {
      intents: intents,
      entities: {
        orderNumbers: [],
        products: [],
        email: customerEmail
      },
      sentiment: 'neutral',
      priority: 'medium',
      requiresEscalation: false,
      confidence: 0.9 // High confidence from AI
    };
    
    // Extract entities
    const emailMatches = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) analysis.entities.email = emailMatches[0];
    
    const orderMatches = message.match(/#?([A-Z]{0,2}\d{4,}|\w{4,}-\w{4,})/g);
    if (orderMatches) {
      analysis.entities.orderNumbers = orderMatches.map(match => match.replace('#', ''));
    }
    
    // Check for escalation
    if (intents.includes('supportEscalation')) {
      analysis.requiresEscalation = true;
      analysis.priority = 'high';
      analysis.sentiment = 'negative';
    }
    
    return analysis;
  }
  
  /**
   * Analyze message using regex patterns (fallback)
   */
  analyzeMessageWithRegex(message, customerEmail = null) {
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

    // Extract email addresses from message
    const emailMatches = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches && emailMatches.length > 0) {
      analysis.entities.email = emailMatches[0]; // Use first email found
      
      // CRITICAL: If we found an email and no other intents, assume order tracking
      if (analysis.intents.length === 0) {
        console.log('📧 Email detected with no intent - assuming orderTracking');
        analysis.intents.push('orderTracking');
        analysis.confidence = 0.8;
      }
    }

    // Extract order numbers - improved regex
    const orderMatches = message.match(/#?([A-Z]{0,2}\d{4,}|\w{4,}-\w{4,})/g);
    if (orderMatches) {
      analysis.entities.orderNumbers = orderMatches.map(match => match.replace('#', ''));
      
      // CRITICAL: If we found an order number and no other intents, assume order tracking
      if (analysis.intents.length === 0) {
        console.log('📦 Order number detected with no intent - assuming orderTracking');
        analysis.intents.push('orderTracking');
        analysis.confidence = 0.8;
      }
    }

    // Detect intents - Check each pattern and add unique intents
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          if (!analysis.intents.includes(intent)) {
            analysis.intents.push(intent);
            analysis.confidence += 0.2;
          }
          break;
        }
      }
    }

    // IMPORTANT: If message contains "track" or "order", prioritize order tracking intent
    if ((lowerMessage.includes('track') || lowerMessage.includes('order')) && 
        !analysis.intents.includes('orderTracking')) {
      console.log('🔍 Adding orderTracking intent based on keywords');
      analysis.intents.unshift('orderTracking'); // Add to beginning of array
      analysis.confidence += 0.3;
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

    // If no intents detected but message contains product/order/cart keywords, add appropriate intent
    if (analysis.intents.length === 0) {
      // AGGRESSIVE FALLBACK: Detect common query patterns
      if (/track|order|status|where|ship|delivery|package|arrive/i.test(lowerMessage)) {
        console.log('⚡ AGGRESSIVE FALLBACK: Adding orderTracking intent');
        analysis.intents.push('orderTracking');
        analysis.confidence = 0.7;
      } else if (/product|item|catalog|shop|store|buy|purchase|show|looking|need|want/i.test(lowerMessage)) {
        console.log('⚡ AGGRESSIVE FALLBACK: Adding productSearch intent');
        analysis.intents.push('productSearch');
        analysis.confidence = 0.7;
      } else if (/cart|checkout/i.test(lowerMessage)) {
        console.log('⚡ AGGRESSIVE FALLBACK: Adding cartInquiry intent');
        analysis.intents.push('cartInquiry');
        analysis.confidence = 0.7;
      }
    }

    console.log('📊 Regex analysis complete:', {
      message: message.substring(0, 50),
      detectedIntents: analysis.intents,
      confidence: analysis.confidence
    });

    return analysis;
  }

  /**
   * Generate smart response suggestions based on analysis
   */
  generateResponsePlan(analysis, originalMessage = '', conversationId = null) {
    const plan = {
      actions: [],
      responseType: 'standard',
      integrationCalls: []
    };
    
    console.log('🔍 Generating response plan for:', originalMessage);
    console.log('🔍 Detected intents:', analysis.intents);

    // Order tracking requests - PRIORITY
    if (analysis.intents.includes('orderTracking')) {
      console.log('📦 Order tracking intent detected');
      console.log('📧 Email from analysis:', analysis.entities.email);
      console.log('📝 Order numbers from analysis:', analysis.entities.orderNumbers);
      
      // Get existing context to merge with new data
      const existingContext = conversationId ? this.getConversationContext(conversationId) : null;
      
      // Merge collected data from context with new entities
      const mergedEmail = analysis.entities.email || existingContext?.collectedData?.email;
      const mergedOrderNumbers = analysis.entities.orderNumbers?.length > 0 
        ? analysis.entities.orderNumbers 
        : existingContext?.collectedData?.orderNumbers || [];
      
      console.log('🔀 Merged data:', { email: mergedEmail, orderNumbers: mergedOrderNumbers });
      
      // Store/update context for follow-ups
      if (conversationId) {
        const needsMoreInfo = !mergedEmail || mergedOrderNumbers.length === 0;
        
        if (needsMoreInfo) {
          console.log('💾 Storing context - waiting for more info');
          this.setConversationContext(conversationId, {
            activeIntent: 'orderTracking',
            waitingFor: !mergedEmail ? 'email' : 'order_number',
            collectedData: {
              email: mergedEmail,
              orderNumbers: mergedOrderNumbers
            }
          });
        } else {
          // Have everything - update context but keep it (don't clear yet)
          console.log('✅ Have all info - updating context');
          this.setConversationContext(conversationId, {
            activeIntent: 'orderTracking',
            waitingFor: null,
            collectedData: {
              email: mergedEmail,
              orderNumbers: mergedOrderNumbers
            }
          });
        }
      }
      
      plan.actions.push({
        type: 'shopify_order_lookup',
        email: mergedEmail,
        orderNumbers: mergedOrderNumbers
      });
      plan.responseType = 'order_status';
    }

    // Product search requests
    else if (analysis.intents.includes('productSearch')) {
      console.log('🛍️ Product search intent detected');
      // Extract product keywords from message - IMPROVED
      let searchQuery = 'general';
      
      // First check if we have explicit product entities
      if (analysis.entities.products && analysis.entities.products.length > 0) {
        searchQuery = analysis.entities.products[0];
      } else {
        // Extract meaningful search terms from the message
        // Remove common stop words and chat phrases
        const stopWords = ['show', 'me', 'get', 'find', 'looking', 'for', 'some', 'the', 'a', 'an', 'need', 'want', 'buy', 'purchase', 'i', 'am', 'can', 'you', 'what', 'is', 'are', 'do', 'does', 'have', 'any', 'your'];
        
        const words = originalMessage.toLowerCase()
          .replace(/[^a-z0-9\s-]/gi, ' ') // Remove special chars except hyphens
          .split(/\s+/)
          .filter(word => word.length > 2 && !stopWords.includes(word));
        
        // If we have meaningful words after filtering, use them as search query
        if (words.length > 0) {
          // Take first 2-3 meaningful words as search query
          searchQuery = words.slice(0, 3).join(' ');
          console.log('🔍 Extracted search query:', searchQuery);
        }
      }
      
      plan.actions.push({
        type: 'shopify_product_search',
        products: analysis.entities.products,
        query: searchQuery
      });
      plan.responseType = 'product_recommendations';
    }
    
    // Cart inquiry requests
    else if (analysis.intents.includes('cartInquiry')) {
      console.log('🛒 Cart inquiry intent detected');
      plan.actions.push({
        type: 'shopify_cart_view',
        email: analysis.entities.email
      });
      plan.responseType = 'cart_display';
    }
    
    // Product detail questions
    else if (analysis.intents.includes('productQuestion')) {
      console.log('📋 Product question intent detected');
      plan.actions.push({
        type: 'shopify_product_details',
        query: originalMessage
      });
      plan.responseType = 'product_details';
    }

    // Support escalation
    if (analysis.requiresEscalation) {
      console.log('🚨 Escalation required');
      plan.actions.push({
        type: 'kustomer_escalation',
        priority: analysis.priority,
        sentiment: analysis.sentiment,
        reason: analysis.intents.includes('supportEscalation') ? 'customer_request' : 'sentiment_analysis'
      });
      if (!plan.responseType || plan.responseType === 'standard') {
        plan.responseType = 'escalation';
      }
    }

    // Billing issues
    if (analysis.intents.includes('billingInquiry')) {
      console.log('💳 Billing inquiry detected');
      plan.actions.push({
        type: 'kustomer_ticket_creation',
        category: 'billing',
        priority: analysis.priority
      });
      plan.responseType = 'billing_support';
    }
    
    // FALLBACK: Check for order/track keywords even if no intent detected
    if (plan.actions.length === 0) {
      const lowerMessage = originalMessage.toLowerCase();
      if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
        console.log('⚡ Fallback: Detecting order-related keywords, adding order lookup action');
        plan.actions.push({
          type: 'shopify_order_lookup',
          email: analysis.entities.email,
          orderNumbers: analysis.entities.orderNumbers
        });
        plan.responseType = 'order_status';
      } else if (/product|item|catalog|shop|store|buy|purchase/i.test(originalMessage)) {
        console.log('⚡ Fallback: Detecting product-related message, adding product search action');
        plan.actions.push({
          type: 'shopify_product_search',
          products: [],
          query: 'general'
        });
        plan.responseType = 'product_recommendations';
      }
    }

    console.log('📊 Response plan complete:', {
      responseType: plan.responseType,
      actionCount: plan.actions.length,
      actions: plan.actions.map(a => a.type)
    });

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

    console.log('📝 Formatting response for type:', plan.responseType);

    switch (plan.responseType) {
      case 'order_status':
        // Make sure email is passed correctly
        const orderAction = plan.actions.find(a => a.type === 'shopify_order_lookup') || plan.actions[0];
        response = this.formatOrderResponse(integrationResults.shopify, originalMessage, orderAction);
        break;
        
      case 'product_recommendations':
        response = this.formatProductResponse(integrationResults.shopify);
        break;
      
      case 'cart_display':
        response = this.formatCartResponse(integrationResults.shopify);
        break;
      
      case 'product_details':
        response = this.formatProductDetailsResponse(integrationResults.shopify, originalMessage);
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
    // Check if we're missing required information
    // IMPROVED: Also check the original message for email
    let effectiveEmail = action?.email;
    
    // Re-extract email from message if not in action
    if (!effectiveEmail || effectiveEmail === 'null' || effectiveEmail === 'undefined') {
      const emailMatch = originalMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatch && emailMatch.length > 0) {
        effectiveEmail = emailMatch[0];
        console.log('📧 Re-extracted email from message:', effectiveEmail);
      }
    }
    
    const hasEmail = effectiveEmail && effectiveEmail !== 'null' && effectiveEmail !== 'undefined';
    const hasOrderNumber = action?.orderNumbers && action.orderNumbers.length > 0;
    
    console.log('📧 Order lookup - Email check:', { hasEmail, email: effectiveEmail, hasOrderNumber });
    
    // If missing both, ask for email first
    if (!hasEmail && !hasOrderNumber) {
      return {
        text: "I'll help you track your order! To get started, I need some information:\n\n" +
              "📧 **What email address did you use for your order?**\n\n" +
              "Please provide your email address so I can look up your order.\n\n" +
              "Example: *my email is john@example.com*",
        actions: [
          { type: 'quick_reply', label: 'I have my order number', value: 'My order number is ' }
        ],
        metadata: { 
          source: 'smart_integration', 
          confidence: 0.8, 
          integrationsUsed: [],
          needsInfo: 'email'
        }
      };
    }
    
    // If we have email but no order number, and no orders found
    if (hasEmail && !hasOrderNumber && (!shopifyData || !shopifyData.orders || shopifyData.orders.length === 0)) {
      return {
        text: `I searched for orders with email **${effectiveEmail}**, but I couldn't find any orders.

` +
              "This could mean:\n" +
              "• The email address is different from what you used to place the order\n" +
              "• The order hasn't been created in our system yet\n\n" +
              "📦 **Do you have your order number?** Please provide it so I can look it up directly.\n\n" +
              "Order numbers typically look like: #1234, #ABC1234, etc.",
        actions: [
          { type: 'quick_reply', label: '📦 I have my order number', value: 'My order number is ' },
          { type: 'escalate', label: '🚀 Speak to Agent', priority: 'high' },
          { type: 'quick_reply', label: 'Try different email', value: 'My email is ' }
        ],
        metadata: { 
          source: 'smart_integration', 
          confidence: 0.6, 
          integrationsUsed: ['shopify'],
          needsInfo: 'order_number',
          searchedEmail: effectiveEmail
        }
      };
    }
    
    // Check if Shopify integration failed completely
    if (!shopifyData) {
      return this.formatOrderFallbackResponse(action, originalMessage);
    }

    // Check if no orders found
    if (!shopifyData.orders || shopifyData.orders.length === 0) {
      return this.formatOrderNotFoundResponse(action, originalMessage);
    }

    // Format successful order response with full tracking details
    const latestOrder = shopifyData.orders[0];
    const status = this.getOrderStatus(latestOrder);
    const fulfillments = latestOrder.fulfillments || [];
    const latestFulfillment = fulfillments.length > 0 ? fulfillments[0] : null;
    
    let responseText = `✅ **Order Found!**\n\n`;
    responseText += `📦 **Order #${latestOrder.name || latestOrder.order_number}**\n`;
    
    // Show items
    if (latestOrder.line_items && latestOrder.line_items.length > 0) {
      responseText += `\n**Items:**\n`;
      latestOrder.line_items.slice(0, 3).forEach(item => {
        responseText += `• ${item.title} (x${item.quantity})\n`;
      });
      if (latestOrder.line_items.length > 3) {
        responseText += `• ...and ${latestOrder.line_items.length - 3} more items\n`;
      }
    }
    
    responseText += `\n💰 **Total**: ${latestOrder.total_price}\n`;
    responseText += `📊 **Status**: ${status}\n`;
    
    // Show tracking information if available
    if (latestFulfillment && latestFulfillment.tracking_number) {
      responseText += `\n🚚 **Shipping Information:**\n`;
      responseText += `📍 **Tracking #**: ${latestFulfillment.tracking_number}\n`;
      
      if (latestFulfillment.tracking_company) {
        responseText += `📫 **Carrier**: ${latestFulfillment.tracking_company}\n`;
      }
      
      if (latestFulfillment.tracking_url) {
        responseText += `🔗 **Track online**: ${latestFulfillment.tracking_url}\n`;
      }
      
      if (latestFulfillment.updated_at) {
        const updateDate = new Date(latestFulfillment.updated_at);
        responseText += `🕐 **Last updated**: ${updateDate.toLocaleDateString()}\n`;
      }
    } else if (latestOrder.tracking_number) {
      // Fallback to order-level tracking
      responseText += `\n🚚 **Tracking Number**: ${latestOrder.tracking_number}\n`;
      if (latestOrder.tracking_url) {
        responseText += `🔗 ${latestOrder.tracking_url}\n`;
      }
    }
    
    // Add status-specific messages
    if (latestOrder.fulfillment_status === 'fulfilled') {
      responseText += `\n✅ **Delivered!** Hope you're enjoying your purchase!`;
    } else if (latestOrder.fulfillment_status === 'shipped' || latestOrder.fulfillment_status === 'partial') {
      responseText += `\n🚚 **In Transit** - Your order is on the way!`;
    } else if (latestOrder.financial_status === 'paid' && !latestOrder.fulfillment_status) {
      responseText += `\n⏳ **Processing** - We're preparing your order for shipment.`;
      responseText += `\nExpected to ship within 1-2 business days.`;
    }
    
    // Show shipping address
    if (latestOrder.shipping_address) {
      const addr = latestOrder.shipping_address;
      responseText += `\n\n📍 **Shipping to:**\n`;
      responseText += `${addr.address1 || ''}\n`;
      if (addr.address2) responseText += `${addr.address2}\n`;
      responseText += `${addr.city || ''}, ${addr.province_code || ''} ${addr.zip || ''}\n`;
    }

    const actions = [];
    
    // Only add tracking link if it exists
    if (latestFulfillment?.tracking_url || latestOrder.tracking_url) {
      actions.push({ 
        type: 'external_link', 
        label: '📦 Track Package Online', 
        url: latestFulfillment?.tracking_url || latestOrder.tracking_url
      });
    }
    
    actions.push({ type: 'escalate', label: '💬 Questions? Chat with Agent' });

    return {
      text: responseText,
      actions,
      metadata: { 
        source: 'smart_integration', 
        confidence: 0.95, 
        integrationsUsed: ['shopify'],
        orderNumber: latestOrder.name || latestOrder.order_number,
        trackingNumber: latestFulfillment?.tracking_number || latestOrder.tracking_number
      }
    };
  }

  formatOrderFallbackResponse(action, originalMessage) {
    let responseText = `I'd be happy to help you track your order! `;
    
    // If we detected an order number, mention it
    if (action.orderNumbers && action.orderNumbers.length > 0) {
      responseText += `I see you mentioned order #${action.orderNumbers[0]}. `;
    }
    
    responseText += `To find your order, I'll need:\n\n`;
    responseText += `📧 **Your email address** (used for the order)\n`;
    responseText += `📦 **Your order number** (if you have it)\n\n`;
    responseText += `Please provide this information and I'll look up your order status right away!`;

    return {
      text: responseText,
      actions: [
        { type: 'quick_reply', label: '📧 Provide email', value: 'My email is ' },
        { type: 'quick_reply', label: '📦 Provide order number', value: 'My order number is ' },
        { type: 'escalate', label: '💬 Chat with Agent' }
      ],
      metadata: { source: 'smart_integration_fallback', confidence: 0.7, integrationsUsed: [] }
    };
  }

  formatOrderNotFoundResponse(action, originalMessage) {
    const hasEmail = action.email && action.email !== 'null' && action.email !== 'undefined';
    const hasOrderNumber = action.orderNumbers && action.orderNumbers.length > 0;
    const effectiveEmail = action.email; // Define effectiveEmail for use in this function
    
    let responseText = `🔍 I'm having trouble finding your order. Let me help you locate it:\n\n`;
    
    if (hasEmail && hasOrderNumber) {
      responseText += `I searched for:\n`;
      responseText += `• Email: **${effectiveEmail}**\n`;
      responseText += `• Order #: **${action.orderNumbers[0]}**\n\n`;
      responseText += `The order might not be in our system yet if it was just placed, or there could be a typo.\n\n`;
      responseText += `**Let's try:**\n`;
      responseText += `• Double-check the order number\n`;
      responseText += `• Verify the email address\n`;
      responseText += `• Or connect with an agent who can search more thoroughly`;
    } else if (hasEmail) {
      responseText += `I searched for orders with email **${effectiveEmail}**, but didn't find any.\n\n`;
      responseText += `This could mean:\n`;
      responseText += `• The order is very recent and still processing\n`;
      responseText += `• You used a different email address\n`;
      responseText += `• The order was placed as a guest\n\n`;
      responseText += `**Do you have your order number?** That would help me find it immediately!`;
    } else if (hasOrderNumber) {
      responseText += `I searched for order #**${action.orderNumbers[0]}**, but couldn't locate it.\n\n`;
      responseText += `**Can you provide the email address used for this order?**\nThis will help me search more accurately.`;
    }

    return {
      text: responseText,
      actions: [
        { type: 'escalate', label: '🚀 Connect with Agent', priority: 'high' },
        { type: 'quick_reply', label: '📧 Try different email', value: 'My email is ' },
        { type: 'quick_reply', label: '📦 Provide order number', value: 'My order number is ' }
      ],
      metadata: { 
        source: 'smart_integration', 
        confidence: 0.6, 
        integrationsUsed: ['shopify'],
        searchedEmail: effectiveEmail,
        searchedOrderNumber: action.orderNumbers?.[0]
      }
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
  
  formatCartResponse(shopifyData) {
    // For now, show draft orders as "cart items"
    if (!shopifyData || !shopifyData.draft_orders || shopifyData.draft_orders.length === 0) {
      return {
        text: "🛒 Your cart is currently empty.\n\nWould you like to browse our products?",
        actions: [
          { type: 'quick_reply', label: 'Show Products', value: 'show me products' },
          { type: 'quick_reply', label: 'Best Sellers', value: 'show me best sellers' }
        ],
        metadata: { source: 'smart_integration', confidence: 0.8, integrationsUsed: ['shopify'] }
      };
    }

    const cartItems = shopifyData.draft_orders;
    let responseText = `🛒 **Your Cart**\n\n`;
    let totalPrice = 0;

    cartItems.forEach((item, index) => {
      const lineItem = item.line_items?.[0];
      if (lineItem) {
        responseText += `${index + 1}. **${lineItem.title}**\n`;
        responseText += `   💰 ${lineItem.price} x ${lineItem.quantity}\n`;
        totalPrice += parseFloat(lineItem.price) * lineItem.quantity;
      }
    });

    responseText += `\n**Total**: ${totalPrice.toFixed(2)}`;

    return {
      text: responseText,
      actions: [
        { type: 'external_link', label: '🛍️ Complete Checkout', url: cartItems[0].invoice_url || '#' },
        { type: 'quick_reply', label: 'Continue Shopping', value: 'show me more products' }
      ],
      metadata: { 
        source: 'smart_integration', 
        confidence: 0.9, 
        integrationsUsed: ['shopify'],
        cartTotal: totalPrice
      }
    };
  }
  
  formatProductDetailsResponse(shopifyData, originalMessage) {
    if (!shopifyData || !shopifyData.products || shopifyData.products.length === 0) {
      return {
        text: "I couldn't find specific details about that product. Could you provide the product name or let me show you our available products?",
        actions: [
          { type: 'quick_reply', label: 'Show All Products', value: 'show me products' },
          { type: 'escalate', label: 'Speak to Specialist' }
        ],
        metadata: { source: 'smart_integration', confidence: 0.5, integrationsUsed: ['shopify'] }
      };
    }

    const product = shopifyData.products[0];
    const variant = product.variants?.[0];
    
    let responseText = `📦 **${product.title}**\n\n`;
    
    if (product.body_html) {
      // Strip HTML and get first 200 chars
      const description = product.body_html.replace(/<[^>]*>/g, '').substring(0, 200);
      responseText += `${description}...\n\n`;
    }
    
    if (variant) {
      responseText += `💰 **Price**: ${variant.price}\n`;
      if (variant.compare_at_price && parseFloat(variant.compare_at_price) > parseFloat(variant.price)) {
        responseText += `~~${variant.compare_at_price}~~ **SALE!**\n`;
      }
      responseText += `📦 **Availability**: ${variant.inventory_quantity > 0 ? 'In Stock' : 'Out of Stock'}\n`;
    }
    
    if (product.vendor) {
      responseText += `🏢 **Brand**: ${product.vendor}\n`;
    }

    return {
      text: responseText,
      actions: [
        { type: 'add_to_cart', label: '🛒 Add to Cart', data: { product, variantId: variant?.id, quantity: 1 } },
        { type: 'quick_reply', label: 'Show Similar Products', value: `show me ${product.product_type || 'products'}` }
      ],
      metadata: { 
        source: 'smart_integration', 
        confidence: 0.9, 
        integrationsUsed: ['shopify'],
        products: [product]
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
    console.log('🔍 Getting order status for:', {
      name: order.name || order.order_number,
      fulfillment_status: order.fulfillment_status,
      financial_status: order.financial_status,
      cancelled_at: order.cancelled_at,
      has_fulfillments: order.fulfillments?.length > 0
    });
    
    if (order.cancelled_at) return 'Cancelled';
    
    // Check fulfillment status more accurately
    // Shopify API can return: null, 'fulfilled', 'partial', or 'restocked'
    if (order.fulfillment_status === 'fulfilled') {
      console.log('✅ Order fulfilled');
      return 'Delivered';
    }
    
    // Check if there are fulfillments with shipment status
    if (order.fulfillments && order.fulfillments.length > 0) {
      const latestFulfillment = order.fulfillments[0];
      console.log('📦 Latest fulfillment:', {
        status: latestFulfillment.status,
        shipment_status: latestFulfillment.shipment_status,
        has_tracking: !!latestFulfillment.tracking_number
      });
      
      // Check shipment_status field (can be: 'delivered', 'in_transit', 'out_for_delivery', etc.)
      if (latestFulfillment.shipment_status === 'delivered') {
        console.log('✅ Shipment delivered');
        return 'Delivered';
      }
      if (latestFulfillment.shipment_status === 'out_for_delivery') {
        console.log('🚚 Out for delivery');
        return 'Out for Delivery';
      }
      if (latestFulfillment.shipment_status === 'in_transit') {
        console.log('🚚 In transit');
        return 'Shipped - In Transit';
      }
      
      // If fulfillment exists and has status 'success', it's shipped
      if (latestFulfillment.status === 'success' || latestFulfillment.tracking_number) {
        console.log('🚚 Shipped');
        return 'Shipped';
      }
    }
    
    if (order.fulfillment_status === 'partial') return 'Partially Shipped';
    
    // Financial status checks
    if (order.financial_status === 'pending') return 'Payment Processing';
    if (order.financial_status === 'paid' && !order.fulfillment_status) return 'Processing';
    
    console.log('⏳ Default status: Processing');
    return 'Processing';
  }

  /**
   * Analyze message history for conversation patterns
   * This is different from the getConversationContext above which retrieves stored context
   */
  analyzeConversationHistory(messages, customerId) {
    const context = {
      messageCount: messages?.length || 0,
      hasOrderInquiries: false,
      hasProductQuestions: false,
      sentimentHistory: [],
      topics: []
    };

    // Guard against non-array input
    if (!Array.isArray(messages)) {
      console.warn('⚠️ analyzeConversationHistory expected array, got:', typeof messages);
      return context;
    }

    messages.forEach(message => {
      if (message.sender_type === 'user') {
        // Use regex analysis only to avoid infinite recursion
        const analysis = this.analyzeMessageWithRegex(message.content);
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