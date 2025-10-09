// Customer Context Provider - Aggregates customer data from all sources
import { integrationOrchestrator } from './integrationOrchestrator';

class CustomerContextProvider {
  constructor() {
    this.contextCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive customer context
   */
  async getCustomerContext(email, conversationId = null, forceRefresh = false) {
    const cacheKey = `${email || 'anonymous'}_${conversationId || 'no_conv'}`;
    
    // Check cache first
    if (!forceRefresh && this.contextCache.has(cacheKey)) {
      const cached = this.contextCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const context = await integrationOrchestrator.getCustomerContext(email, conversationId);
      
      // Enhance with computed metrics
      const enhancedContext = this.enhanceContext(context);
      
      // Cache the result
      this.contextCache.set(cacheKey, {
        data: enhancedContext,
        timestamp: Date.now()
      });

      return enhancedContext;

    } catch (error) {
      console.error('Error getting customer context:', error);
      return this.getDefaultContext(email, conversationId);
    }
  }

  /**
   * Enhance context with computed metrics and insights
   */
  enhanceContext(baseContext) {
    const enhanced = {
      ...baseContext,
      insights: {
        customerTier: 'standard',
        riskLevel: 'low',
        preferredChannel: 'chat',
        responseTime: 'standard',
        suggestedActions: []
      }
    };

    // Compute customer tier based on Shopify data
    if (baseContext.shopify?.customer) {
      const totalSpent = parseFloat(baseContext.shopify.customer.total_spent || 0);
      const orderCount = baseContext.shopify.customer.orders_count || 0;

      if (totalSpent > 1000 || orderCount > 10) {
        enhanced.insights.customerTier = 'vip';
        enhanced.insights.responseTime = 'priority';
      } else if (totalSpent > 500 || orderCount > 5) {
        enhanced.insights.customerTier = 'valued';
      }
    }

    // Compute risk level based on Kustomer data
    if (baseContext.kustomer?.insights) {
      const satisfactionScore = baseContext.kustomer.insights.satisfactionScore || 5;
      const conversationCount = baseContext.kustomer.insights.totalConversations || 0;

      if (satisfactionScore < 3 && conversationCount > 3) {
        enhanced.insights.riskLevel = 'high';
        enhanced.insights.responseTime = 'urgent';
      } else if (satisfactionScore < 4) {
        enhanced.insights.riskLevel = 'medium';
      }
    }

    // Generate suggested actions
    enhanced.insights.suggestedActions = this.generateSuggestedActions(enhanced);

    return enhanced;
  }

  /**
   * Generate suggested actions for agents
   */
  generateSuggestedActions(context) {
    const actions = [];

    // Recent order actions
    if (context.shopify?.orders?.length > 0) {
      const latestOrder = context.shopify.orders[0];
      actions.push({
        type: 'order_status',
        label: `Check Order #${latestOrder.name}`,
        data: { orderId: latestOrder.id, orderNumber: latestOrder.name }
      });

      if (latestOrder.fulfillment_status !== 'fulfilled') {
        actions.push({
          type: 'shipping_update',
          label: 'Provide Shipping Update',
          data: { orderId: latestOrder.id }
        });
      }
    }

    // Customer tier actions
    if (context.insights.customerTier === 'vip') {
      actions.push({
        type: 'vip_treatment',
        label: 'Apply VIP Treatment',
        data: { tier: 'vip' }
      });
    }

    // Risk level actions
    if (context.insights.riskLevel === 'high') {
      actions.push({
        type: 'escalate_manager',
        label: 'Escalate to Manager',
        data: { reason: 'high_risk_customer' }
      });
    }

    // Product recommendations
    if (context.shopify?.customer && context.shopify.orders?.length > 0) {
      actions.push({
        type: 'product_recommendations',
        label: 'Suggest Products',
        data: { customerId: context.shopify.customer.id }
      });
    }

    return actions;
  }

  /**
   * Get default context for when data is unavailable
   */
  getDefaultContext(email, conversationId) {
    return {
      email: email || null,
      conversationId: conversationId || null,
      shopify: null,
      kustomer: null,
      insights: {
        customerTier: 'standard',
        riskLevel: 'low',
        preferredChannel: 'chat',
        responseTime: 'standard',
        suggestedActions: []
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update context with new information
   */
  async updateContext(email, conversationId, updates) {
    const cacheKey = `${email || 'anonymous'}_${conversationId || 'no_conv'}`;
    
    try {
      const currentContext = await this.getCustomerContext(email, conversationId);
      const updatedContext = {
        ...currentContext,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      this.contextCache.set(cacheKey, {
        data: updatedContext,
        timestamp: Date.now()
      });

      return updatedContext;

    } catch (error) {
      console.error('Error updating context:', error);
      return null;
    }
  }

  /**
   * Clear context cache
   */
  clearCache(email = null, conversationId = null) {
    if (email && conversationId) {
      // Clear specific context
      const cacheKey = `${email}_${conversationId}`;
      this.contextCache.delete(cacheKey);
    } else {
      // Clear all cache
      this.contextCache.clear();
    }
  }

  /**
   * Get context summary for display
   */
  getContextSummary(context) {
    const summary = {
      customer: {
        name: context.email || 'Anonymous',
        tier: context.insights?.customerTier || 'standard',
        riskLevel: context.insights?.riskLevel || 'low'
      },
      shopify: null,
      kustomer: null,
      actionItems: context.insights?.suggestedActions || []
    };

    // Shopify summary
    if (context.shopify?.customer) {
      summary.shopify = {
        totalSpent: context.shopify.customer.total_spent || '0',
        orderCount: context.shopify.customer.orders_count || 0,
        recentOrders: (context.shopify.orders || []).slice(0, 3).map(order => ({
          id: order.id,
          name: order.name,
          total: order.total_price,
          status: this.getOrderStatus(order),
          date: order.created_at
        }))
      };
    }

    // Kustomer summary  
    if (context.kustomer?.customer) {
      summary.kustomer = {
        totalConversations: context.kustomer.insights?.totalConversations || 0,
        satisfactionScore: context.kustomer.insights?.satisfactionScore || 5,
        lastContact: context.kustomer.insights?.lastContact,
        preferredChannel: context.kustomer.insights?.preferredChannel || 'chat'
      };
    }

    return summary;
  }

  /**
   * Helper to get order status
   */
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
   * Check if context needs refresh
   */
  needsRefresh(email, conversationId) {
    const cacheKey = `${email || 'anonymous'}_${conversationId || 'no_conv'}`;
    
    if (!this.contextCache.has(cacheKey)) {
      return true;
    }

    const cached = this.contextCache.get(cacheKey);
    return Date.now() - cached.timestamp >= this.cacheExpiry;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.contextCache.size,
      keys: Array.from(this.contextCache.keys()),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const customerContextProvider = new CustomerContextProvider();