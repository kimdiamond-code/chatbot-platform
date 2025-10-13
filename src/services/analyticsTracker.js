// ===================================================================
// ANALYTICS TRACKER - Real-time event tracking for all chatbot metrics
// Captures: Sales, Engagement, Insights, Shoppers Intelligence
// ===================================================================

import { dbService } from './databaseService';

class AnalyticsTracker {
  constructor() {
    this.orgId = '00000000-0000-0000-0000-000000000001';
    this.sessionData = new Map(); // Track per-conversation session data
  }

  // ===================================================================
  // CORE EVENT TRACKING
  // ===================================================================

  /**
   * Track a generic analytics event
   */
  async trackEvent(conversationId, eventType, eventData = {}) {
    try {
      await dbService.createAnalyticsEvent({
        organization_id: this.orgId,
        conversation_id: conversationId,
        event_type: eventType,
        event_data: eventData
      });
      
      console.log(`📊 Analytics Event: ${eventType}`, eventData);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Update conversation metadata
   */
  async updateConversationMetadata(conversationId, metadata) {
    try {
      const session = this.sessionData.get(conversationId) || {};
      const updatedMetadata = { ...session, ...metadata };
      this.sessionData.set(conversationId, updatedMetadata);

      // Update in database (would need to add this endpoint)
      // For now, metadata is tracked through events
      console.log(`📝 Updated metadata for ${conversationId}:`, metadata);
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  // ===================================================================
  // SALES METRICS TRACKING
  // ===================================================================

  /**
   * Track when a conversation starts
   */
  async trackConversationStarted(conversationId, metadata = {}) {
    await this.trackEvent(conversationId, 'conversation_started', {
      timestamp: new Date().toISOString(),
      ...metadata
    });
    
    // Initialize session tracking
    this.sessionData.set(conversationId, {
      startTime: Date.now(),
      messageCount: 0,
      productsDiscussed: [],
      categoriesDiscussed: [],
      missingInfo: [],
      ...metadata
    });
  }

  /**
   * Track PDP (Product Detail Page) redirect
   */
  async trackPDPRedirect(conversationId, productData) {
    await this.trackEvent(conversationId, 'redirected_to_pdp', {
      product_id: productData.id,
      product_name: productData.title,
      product_url: productData.url,
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      redirectedToPDP: true,
      viewedProduct: true
    });
  }

  /**
   * Track add to cart action
   */
  async trackAddToCart(conversationId, productData, quantity = 1) {
    await this.trackEvent(conversationId, 'product_added_to_cart', {
      product_id: productData.id,
      product_name: productData.title,
      product_price: productData.price,
      quantity: quantity,
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      addedToCart: true
    });
  }

  /**
   * Track order placed (AI-generated sale)
   */
  async trackOrderPlaced(conversationId, orderData) {
    const { order_id, order_value, items } = orderData;
    
    await this.trackEvent(conversationId, 'order_placed', {
      order_id,
      order_value,
      items_count: items?.length || 0,
      items: items,
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      orderPlaced: true,
      orderValue: order_value
    });
  }

  /**
   * Track conversion (when a visitor becomes a customer)
   */
  async trackConversion(conversationId, conversionData = {}) {
    await this.trackEvent(conversationId, 'conversion_achieved', {
      ...conversionData,
      timestamp: new Date().toISOString()
    });
  }

  // ===================================================================
  // ENGAGEMENT METRICS TRACKING
  // ===================================================================

  /**
   * Track message sent (for engagement calculations)
   */
  async trackMessage(conversationId, messageData) {
    const session = this.sessionData.get(conversationId);
    if (session) {
      session.messageCount = (session.messageCount || 0) + 1;
      
      // Track engagement milestone (3+ messages = engaged)
      if (session.messageCount === 3 && !session.engaged) {
        session.engaged = true;
        await this.trackEvent(conversationId, 'engagement_achieved', {
          message_count: 3,
          time_to_engagement: Date.now() - session.startTime,
          timestamp: new Date().toISOString()
        });
      }
    }

    await this.trackEvent(conversationId, 'message_sent', {
      sender_type: messageData.sender_type,
      content_length: messageData.content?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track proactive engagement
   */
  async trackProactiveEngagement(conversationId, triggerData) {
    await this.trackEvent(conversationId, 'proactive_trigger', {
      trigger_type: triggerData.trigger_type,
      trigger_name: triggerData.trigger_name,
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      isProactive: true,
      proactiveTrigger: triggerData.trigger_type
    });
  }

  /**
   * Track customer type identification
   */
  async trackCustomerType(conversationId, customerType) {
    await this.trackEvent(conversationId, 'customer_type_identified', {
      customer_type: customerType, // 'new', 'returning', 'vip', 'anonymous'
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      customerType: customerType
    });
  }

  // ===================================================================
  // SHOPPERS INTELLIGENCE TRACKING
  // ===================================================================

  /**
   * Track product discussion
   */
  async trackProductDiscussion(conversationId, productData) {
    const session = this.sessionData.get(conversationId);
    if (session) {
      if (!session.productsDiscussed) session.productsDiscussed = [];
      if (!session.productsDiscussed.includes(productData.id)) {
        session.productsDiscussed.push(productData.id);
      }
    }

    await this.trackEvent(conversationId, 'product_discussed', {
      product_id: productData.id,
      product_name: productData.title,
      product_category: productData.category,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track category discussion
   */
  async trackCategoryDiscussion(conversationId, category) {
    const session = this.sessionData.get(conversationId);
    if (session) {
      if (!session.categoriesDiscussed) session.categoriesDiscussed = [];
      if (!session.categoriesDiscussed.includes(category)) {
        session.categoriesDiscussed.push(category);
      }
    }

    await this.trackEvent(conversationId, 'category_discussed', {
      category: category,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track product search
   */
  async trackProductSearch(conversationId, searchQuery, results) {
    await this.trackEvent(conversationId, 'product_search', {
      search_query: searchQuery,
      results_count: results?.length || 0,
      found_results: results && results.length > 0,
      timestamp: new Date().toISOString()
    });
  }

  // ===================================================================
  // MISSING INFO TRACKING
  // ===================================================================

  /**
   * Track when bot doesn't have information
   */
  async trackMissingInfo(conversationId, missingInfoType, query) {
    const session = this.sessionData.get(conversationId);
    if (session) {
      if (!session.missingInfo) session.missingInfo = [];
      if (!session.missingInfo.includes(missingInfoType)) {
        session.missingInfo.push(missingInfoType);
      }
    }

    await this.trackEvent(conversationId, 'missing_information', {
      info_type: missingInfoType,
      user_query: query,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track bot confidence levels (for AI recommendations)
   */
  async trackBotConfidence(conversationId, confidence, intent) {
    await this.trackEvent(conversationId, 'bot_confidence', {
      confidence_score: confidence,
      detected_intent: intent,
      needs_improvement: confidence < 0.7,
      timestamp: new Date().toISOString()
    });
  }

  // ===================================================================
  // SESSION MANAGEMENT
  // ===================================================================

  /**
   * Track conversation end and calculate session metrics
   */
  async trackConversationEnded(conversationId, endReason = 'user_left') {
    const session = this.sessionData.get(conversationId);
    
    if (session) {
      const sessionDuration = Date.now() - session.startTime;
      const sessionMinutes = Math.round(sessionDuration / 60000);

      await this.trackEvent(conversationId, 'conversation_ended', {
        end_reason: endReason,
        session_duration_ms: sessionDuration,
        session_duration_minutes: sessionMinutes,
        message_count: session.messageCount || 0,
        engaged: session.engaged || false,
        converted: session.orderPlaced || false,
        products_discussed: session.productsDiscussed?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Save final metadata
      await this.updateConversationMetadata(conversationId, {
        ended: true,
        endReason: endReason,
        sessionDuration: sessionDuration,
        ...session
      });

      // Clear session data
      this.sessionData.delete(conversationId);
    }
  }

  /**
   * Get session data for a conversation
   */
  getSessionData(conversationId) {
    return this.sessionData.get(conversationId);
  }

  /**
   * Track satisfaction rating (CSAT/NPS)
   */
  async trackSatisfaction(conversationId, rating, feedback = '') {
    await this.trackEvent(conversationId, 'satisfaction_rating', {
      rating: rating, // 1-5 scale
      feedback: feedback,
      timestamp: new Date().toISOString()
    });

    await this.updateConversationMetadata(conversationId, {
      satisfaction: rating
    });
  }

  // ===================================================================
  // QUICK TRACKING HELPERS
  // ===================================================================

  /**
   * Track complete product interaction flow
   */
  async trackProductInteraction(conversationId, interaction) {
    const { type, product, quantity } = interaction;
    
    switch(type) {
      case 'view':
        await this.trackProductDiscussion(conversationId, product);
        break;
      case 'pdp_redirect':
        await this.trackPDPRedirect(conversationId, product);
        break;
      case 'add_to_cart':
        await this.trackAddToCart(conversationId, product, quantity);
        break;
      case 'purchase':
        await this.trackOrderPlaced(conversationId, {
          order_id: interaction.order_id,
          order_value: interaction.order_value,
          items: [product]
        });
        break;
    }
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();
