// Integration Orchestrator - Coordinates between chat and integrations
import shopifyService from '../integrations/shopifyService.js';
import { demoShopifyService } from '../demoShopifyService.js';
import { kustomerService } from '../integrations/kustomerService';
import { chatIntelligenceService } from './chatIntelligence';

class IntegrationOrchestrator {
  constructor() {
    this.activeIntegrations = {
      shopify: false,
      kustomer: false
    };
    
    this.initializeIntegrations();
  }

  async initializeIntegrations() {
    // Check which integrations are available
    try {
      // Check if credentials are loaded (don't verify connection due to CORS)
      await shopifyService.loadCredentials();
      
      // If we have credentials loaded, consider it connected
      // (API calls will work from backend/server-side, not browser due to CORS)
      this.activeIntegrations.shopify = !!shopifyService.credentialsLoaded && !!shopifyService.accessToken;
      
      if (this.activeIntegrations.shopify) {
        console.log('✅ Shopify integration active (credentials loaded)');
      } else {
        console.log('⚠️ Shopify integration inactive (no credentials)');
      }
    } catch (error) {
      this.activeIntegrations.shopify = false;
      console.log('⚠️ Shopify not connected:', error.message);
    }
    
    this.activeIntegrations.kustomer = kustomerService.isConnected();
    
    console.log('🔗 Integration Orchestrator initialized:', this.activeIntegrations);
  }

  /**
   * Process a chat message through the smart integration pipeline
   */
  async processMessage(message, customerContext = {}) {
    try {
      console.log('🧠 Processing message:', message);
      
      // Step 1: Analyze the message for intents and entities
      const analysis = chatIntelligenceService.analyzeMessage(
        message.content, 
        customerContext.email
      );
      
      console.log('📊 Message analysis:', analysis);

      // Step 2: Generate response plan
      const responsePlan = chatIntelligenceService.generateResponsePlan(analysis, message.content);
      
      console.log('📋 Response plan:', responsePlan);

      // Step 3: Execute integration calls
      const integrationResults = await this.executeIntegrationActions(
        responsePlan.actions, 
        customerContext, 
        message
      );

      // Step 4: Generate smart response
      const smartResponse = chatIntelligenceService.formatSmartResponse(
        responsePlan,
        integrationResults,
        message.content
      );

      return {
        response: smartResponse,
        analysis: analysis,
        integrationResults: integrationResults,
        customerContext: this.enrichCustomerContext(customerContext, integrationResults)
      };

    } catch (error) {
      console.error('❌ Error processing message:', error);
      
      return {
        response: {
          text: "I apologize, but I'm having trouble accessing some of our systems right now. Let me connect you with a human agent who can help you immediately.",
          actions: [
            { type: 'escalate', label: 'Connect to Agent' }
          ],
          metadata: { source: 'error_fallback', confidence: 0.5 }
        },
        analysis: { intents: ['error'], sentiment: 'neutral' },
        integrationResults: {},
        customerContext: customerContext
      };
    }
  }

  /**
   * Execute actions based on response plan
   */
  async executeIntegrationActions(actions, customerContext, message) {
    const results = {
      shopify: null,
      kustomer: null
    };

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'shopify_order_lookup':
            if (this.activeIntegrations.shopify) {
              results.shopify = await this.handleShopifyOrderLookup(action, customerContext);
            }
            break;

          case 'shopify_product_search':
            if (this.activeIntegrations.shopify) {
              results.shopify = await this.handleShopifyProductSearch(action);
            }
            break;

          case 'kustomer_escalation':
            if (this.activeIntegrations.kustomer) {
              results.kustomer = await this.handleKustomerEscalation(action, customerContext, message);
            }
            break;

          case 'kustomer_ticket_creation':
            if (this.activeIntegrations.kustomer) {
              results.kustomer = await this.handleKustomerTicketCreation(action, customerContext, message);
            }
            break;

          default:
            console.log('⚠️ Unknown action type:', action.type);
        }
      } catch (error) {
        console.error(`❌ Error executing ${action.type}:`, error);
      }
    }

    return results;
  }

  /**
   * Handle Shopify order lookup
   */
  async handleShopifyOrderLookup(action, customerContext) {
    try {
      let orders = [];

      // If we have specific order numbers, look them up
      if (action.orderNumbers && action.orderNumbers.length > 0) {
        for (const orderNum of action.orderNumbers) {
          try {
            const order = await shopifyService.findOrderByNumber(orderNum);
            if (order) orders.push(order);
          } catch (error) {
            console.log(`Order ${orderNum} not found`);
          }
        }
      }

      // If no specific orders found or no order numbers provided, get customer orders
      if (orders.length === 0 && action.email) {
        try {
          const customer = await shopifyService.findCustomerByEmail(action.email);
          if (customer) {
            const customerOrders = await shopifyService.getCustomerOrders(customer.id, 5);
            orders = customerOrders || [];
          }
        } catch (error) {
          console.log('Customer not found in Shopify');
        }
      }

      return {
        orders: orders,
        customer: action.email ? await shopifyService.findCustomerByEmail(action.email).catch(() => null) : null
      };

    } catch (error) {
      console.error('Error in Shopify order lookup:', error);
      return { orders: [], customer: null };
    }
  }

  /**
   * Handle Shopify product search
   */
  async handleShopifyProductSearch(action) {
    try {
      let products = [];

      // Check if Shopify is actually connected
      if (this.activeIntegrations.shopify) {
        // Real Shopify
        if (action.query && action.query !== 'general') {
          products = await shopifyService.searchProducts(action.query);
        } else {
          products = await shopifyService.getProducts(6);
        }
      } else {
        // Demo mode - use mock products
        console.log('🎭 DEMO MODE: Using mock Shopify products');
        if (action.query && action.query !== 'general') {
          products = demoShopifyService.searchDemoProducts(action.query);
        } else {
          products = demoShopifyService.getDemoProducts();
        }
      }

      return {
        products: products || [],
        searchQuery: action.query,
        demoMode: !this.activeIntegrations.shopify
      };

    } catch (error) {
      console.error('Error in Shopify product search:', error);
      // Fallback to demo products on error
      console.log('🎭 Falling back to DEMO products due to error');
      return {
        products: demoShopifyService.getDemoProducts(),
        searchQuery: action.query,
        demoMode: true
      };
    }
  }

  /**
   * Handle Kustomer escalation
   */
  async handleKustomerEscalation(action, customerContext, message) {
    try {
      // Find or create customer in Kustomer
      let customer = null;
      if (customerContext.email) {
        try {
          customer = await kustomerService.findCustomer(customerContext.email);
        } catch (error) {
          // Customer not found, create them
          customer = await kustomerService.createCustomer({
            email: customerContext.email,
            name: customerContext.name || 'Chat Customer'
          });
        }
      }

      // Create escalation reason
      const escalationReason = this.generateEscalationReason(action, message);

      // Escalate to human agent
      const escalationResult = await kustomerService.escalateToHuman(
        message.conversation_id || 'chat_conv_' + Date.now(),
        customer?.id || 'anonymous_' + Date.now(),
        escalationReason,
        customerContext.chatHistory || []
      );

      return {
        ticketId: escalationResult?.ticketId,
        escalatedAt: escalationResult?.escalatedAt,
        reason: escalationReason,
        customer: customer
      };

    } catch (error) {
      console.error('Error in Kustomer escalation:', error);
      return {
        ticketId: `DEMO_${Date.now()}`,
        escalatedAt: new Date().toISOString(),
        reason: 'System error - manual escalation',
        customer: null
      };
    }
  }

  /**
   * Handle Kustomer ticket creation
   */
  async handleKustomerTicketCreation(action, customerContext, message) {
    try {
      // Find or create customer
      let customer = null;
      if (customerContext.email) {
        try {
          customer = await kustomerService.findCustomer(customerContext.email);
        } catch (error) {
          customer = await kustomerService.createCustomer({
            email: customerContext.email,
            name: customerContext.name || 'Chat Customer'
          });
        }
      }

      // Generate ticket subject and description
      const subject = this.generateTicketSubject(action, message);
      const description = this.generateTicketDescription(action, message, customerContext);

      // Create ticket
      const ticket = await kustomerService.createTicket(
        customer?.id || 'anonymous_' + Date.now(),
        message.conversation_id || null,
        subject,
        description,
        action.priority || 'medium'
      );

      return {
        ticketId: ticket?.id,
        subject: subject,
        priority: action.priority || 'medium',
        customer: customer
      };

    } catch (error) {
      console.error('Error in Kustomer ticket creation:', error);
      return {
        ticketId: `DEMO_${Date.now()}`,
        subject: 'Customer Support Request',
        priority: action.priority || 'medium',
        customer: null
      };
    }
  }

  /**
   * Generate escalation reason
   */
  generateEscalationReason(action, message) {
    if (action.reason === 'customer_request') {
      return 'Customer requested to speak with a human agent';
    } else if (action.reason === 'sentiment_analysis') {
      return `Customer sentiment detected as ${action.sentiment} - proactive escalation`;
    } else {
      return `Escalation triggered: ${action.sentiment} sentiment, priority: ${action.priority}`;
    }
  }

  /**
   * Generate ticket subject
   */
  generateTicketSubject(action, message) {
    const category = action.category || 'general';
    const timestamp = new Date().toLocaleDateString();
    
    switch (category) {
      case 'billing':
        return `Billing Inquiry - ${timestamp}`;
      case 'order':
        return `Order Support Request - ${timestamp}`;
      case 'technical':
        return `Technical Support - ${timestamp}`;
      default:
        return `Customer Support Request - ${timestamp}`;
    }
  }

  /**
   * Generate ticket description
   */
  generateTicketDescription(action, message, customerContext) {
    let description = `Customer Message: "${message.content}"\n\n`;
    
    if (customerContext.email) {
      description += `Customer Email: ${customerContext.email}\n`;
    }
    
    if (customerContext.name) {
      description += `Customer Name: ${customerContext.name}\n`;
    }
    
    description += `Category: ${action.category || 'General Support'}\n`;
    description += `Priority: ${action.priority || 'Medium'}\n`;
    description += `Created: ${new Date().toLocaleString()}\n\n`;
    description += `This ticket was automatically created by the chatbot system.`;
    
    return description;
  }

  /**
   * Enrich customer context with integration data
   */
  enrichCustomerContext(originalContext, integrationResults) {
    const enriched = { ...originalContext };

    // Add Shopify data
    if (integrationResults.shopify) {
      enriched.shopify = {
        orders: integrationResults.shopify.orders || [],
        customer: integrationResults.shopify.customer,
        products: integrationResults.shopify.products || []
      };
    }

    // Add Kustomer data
    if (integrationResults.kustomer) {
      enriched.kustomer = {
        customerId: integrationResults.kustomer.customer?.id,
        ticketId: integrationResults.kustomer.ticketId,
        escalated: !!integrationResults.kustomer.escalatedAt
      };
    }

    return enriched;
  }

  /**
   * Get customer context from various sources
   */
  async getCustomerContext(email, conversationId = null) {
    const context = {
      email: email,
      conversationId: conversationId,
      shopify: null,
      kustomer: null,
      lastUpdated: new Date().toISOString()
    };

    try {
      // Get Shopify customer data
      if (this.activeIntegrations.shopify && email) {
        const shopifyCustomer = await shopifyService.findCustomerByEmail(email);
        if (shopifyCustomer) {
          const recentOrders = await shopifyService.getCustomerOrders(shopifyCustomer.id, 3);
          context.shopify = {
            customer: shopifyCustomer,
            orders: recentOrders || [],
            totalSpent: shopifyCustomer.total_spent || 0,
            orderCount: shopifyCustomer.orders_count || 0
          };
        }
      }

      // Get Kustomer customer data
      if (this.activeIntegrations.kustomer && email) {
        const kustomerCustomer = await kustomerService.findCustomer(email);
        if (kustomerCustomer) {
          const insights = await kustomerService.getCustomerInsights(kustomerCustomer.id);
          context.kustomer = {
            customer: kustomerCustomer,
            insights: insights,
            totalConversations: insights?.totalConversations || 0,
            satisfactionScore: insights?.satisfactionScore || 0
          };
        }
      }

    } catch (error) {
      console.error('Error getting customer context:', error);
    }

    return context;
  }

  /**
   * Check integration health
   */
  getIntegrationStatus() {
    return {
      shopify: {
        connected: this.activeIntegrations.shopify,
        lastCheck: new Date().toISOString()
      },
      kustomer: {
        connected: this.activeIntegrations.kustomer,
        service: kustomerService.isConnected(), 
        lastCheck: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const integrationOrchestrator = new IntegrationOrchestrator();