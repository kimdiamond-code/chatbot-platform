// Integration Orchestrator - Coordinates between chat and integrations
import { shopifyService } from '../integrations/shopifyService.js';
import { kustomerService } from '../integrations/kustomerService';
import { chatIntelligenceService } from './chatIntelligence';

class IntegrationOrchestrator {
  constructor() {
    this.activeIntegrations = {
      shopify: false,
      kustomer: false
    };
    this.organizationId = null; // Will be set when needed
    
    // Don't initialize on construction - wait for organizationId
  }
  
  setOrganizationId(orgId) {
    this.organizationId = orgId;
    console.log('🏛️ IntegrationOrchestrator - Organization ID set:', orgId);
  }

  async initializeIntegrations(organizationId = null) {
    // Use provided organizationId or stored one
    const orgId = organizationId || this.organizationId;
    
    if (!orgId) {
      console.error('❌ Cannot initialize integrations without organizationId');
      return;
    }
    
    this.organizationId = orgId;
    
    // Check which integrations are available
    try {
      console.log('🔍 Checking Shopify integration...');
      console.log('📍 Organization ID:', orgId);
      
      // Check if Shopify is connected via OAuth
      this.activeIntegrations.shopify = await shopifyService.verifyConnection(orgId);
      
      if (this.activeIntegrations.shopify) {
        console.log('✅ Shopify integration active (OAuth connected)');
        
        // Log credentials details for debugging (without exposing sensitive data)
        const credentials = await shopifyService.getCredentials(orgId);
        if (credentials) {
          console.log('🏪 Shopify store:', credentials.shopDomain);
          console.log('🔑 Has access token:', !!credentials.accessToken);
          console.log('🔗 Connection confirmed:', credentials.connected);
        } else {
          console.error('❌ verifyConnection returned true but getCredentials returned null!');
          this.activeIntegrations.shopify = false;
        }
      } else {
        console.log('🎭 Shopify integration inactive - using demo mode');
        
        // Debug: Try to get credentials manually to see what's wrong
        const debugCreds = await shopifyService.getCredentials(orgId);
        console.log('🔍 Debug credentials check:', {
          hasCredentials: !!debugCreds,
          shopDomain: debugCreds?.shopDomain,
          hasToken: !!debugCreds?.accessToken,
          connected: debugCreds?.connected
        });
      }
    } catch (error) {
      this.activeIntegrations.shopify = false;
      console.error('⚠️ Shopify connection check failed:', error.message);
      console.error('⚠️ Full error:', error);
    }
    
    try {
      this.activeIntegrations.kustomer = kustomerService.isConnected();
      console.log(`👥 Kustomer: ${this.activeIntegrations.kustomer ? 'connected' : 'disconnected'}`);
    } catch (error) {
      this.activeIntegrations.kustomer = false;
      console.log('⚠️ Kustomer check failed:', error.message);
    }
    
    console.log('🔗 Integration Orchestrator initialized:', this.activeIntegrations);
    console.log('⏰ Initialization timestamp:', new Date().toISOString());
  }

  /**
   * Process a chat message through the smart integration pipeline
   */
  async processMessage(message, customerContext = {}) {
    try {
      console.log('🧠 Processing message:', message);
      console.log('👤 Customer context:', customerContext);
      
      // Step 1: Analyze the message for intents and entities (now async with AI)
      const analysis = await chatIntelligenceService.analyzeMessage(
        message.content, 
        customerContext.email,
        customerContext.conversationId || message.conversation_id
      );
      
      console.log('📊 Message analysis:', analysis);

      // Step 2: Generate response plan with conversation context
      const responsePlan = chatIntelligenceService.generateResponsePlan(
        analysis, 
        message.content,
        customerContext.conversationId || message.conversation_id
      );
      
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
            // Always call - handler decides whether to use real Shopify or show instructions
            results.shopify = await this.handleShopifyOrderLookup(action, customerContext);
            break;

          case 'shopify_product_search':
            // Always call - handler decides whether to use real Shopify or demo mode
            results.shopify = await this.handleShopifyProductSearch(action);
            break;
          
          case 'shopify_cart_view':
            // Always call - handler decides whether to use real Shopify or return empty
            results.shopify = await this.handleShopifyCartView(action, customerContext);
            break;
          
          case 'shopify_product_details':
            // Always call - handler decides whether to use real Shopify or demo mode
            results.shopify = await this.handleShopifyProductDetails(action);
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
      console.log('🔍 Order lookup:', { 
        hasEmail: !!action.email, 
        email: action.email,
        hasOrderNumbers: !!action.orderNumbers?.length,
        orderNumbers: action.orderNumbers 
      });
      
      let orders = [];
      const credentials = await shopifyService.getCredentials(this.organizationId);
      
      if (!credentials) {
        console.log('⚠️ No Shopify credentials for order lookup');
        return { orders: [], customer: null };
      }
      
      // Try to fetch orders by email
      if (action.email && action.email !== 'null' && action.email !== 'undefined') {
        try {
          console.log('📧 Fetching orders for email:', action.email);
          
          const response = await fetch('/api/consolidated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: 'database',
              action: 'shopify_getOrders',
              store_url: credentials.shopDomain,
              access_token: credentials.accessToken,
              customer_email: action.email
            })
          });
          
          const data = await response.json();
          
          if (data.success && data.orders) {
            orders = data.orders;
            console.log('✅ Found', orders.length, 'orders for email');
            
            // If they also provided an order number, filter to that specific order
            if (action.orderNumbers && action.orderNumbers.length > 0) {
              const orderNum = action.orderNumbers[0].toString();
              const specificOrder = orders.find(order => 
                order.name?.includes(orderNum) || 
                order.order_number?.toString() === orderNum ||
                order.id?.toString() === orderNum
              );
              
              if (specificOrder) {
                console.log('✅ Found specific order:', specificOrder.name);
                orders = [specificOrder];
              }
            }
          }
        } catch (error) {
          console.error('❌ Error fetching orders by email:', error);
        }
      }
      
      // If still no orders and we have an order number, try searching all orders
      if (orders.length === 0 && action.orderNumbers && action.orderNumbers.length > 0) {
        try {
          console.log('🔍 Searching all orders for number:', action.orderNumbers[0]);
          
          const response = await fetch('/api/consolidated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: 'database',
              action: 'shopify_searchOrders',
              store_url: credentials.shopDomain,
              access_token: credentials.accessToken,
              order_name: action.orderNumbers[0]
            })
          });
          
          const data = await response.json();
          
          // Check if endpoint exists or if it's just no results
          if (response.ok && data.success && data.orders && data.orders.length > 0) {
            orders = data.orders;
            console.log('✅ Found order by number:', orders[0].name);
          } else if (response.status === 400 || (data.error && data.error.includes('Invalid action'))) {
            // Endpoint not deployed yet, skip silently
            console.log('⚠️ Order search endpoint not available yet - skipping advanced search');
          }
        } catch (error) {
          console.error('❌ Error searching orders by number:', error);
          // Don't throw, just log - we'll show "order not found" to user
        }
      }

      return {
        orders: orders,
        customer: null // We don't need customer object for display
      };

    } catch (error) {
      console.error('❌ Error in Shopify order lookup:', error);
      return { orders: [], customer: null };
    }
  }

  /**
   * Handle Shopify product search
   */
  async handleShopifyProductSearch(action) {
    try {
      let products = [];

      // Always use real Shopify - no demo mode
      if (action.query && action.query !== 'general') {
        products = await shopifyService.searchProducts(action.query, this.organizationId);
      } else {
        products = await shopifyService.getProducts(6, this.organizationId);
      }

      return {
        products: products || [],
        searchQuery: action.query
      };

    } catch (error) {
      console.error('❌ Error in Shopify product search:', error);
      // Return empty products if Shopify fails - let the UI handle it
      return {
        products: [],
        searchQuery: action.query,
        error: error.message
      };
    }
  }
  
  /**
   * Handle Shopify cart view - Get draft orders for customer
   */
  async handleShopifyCartView(action, customerContext) {
    try {
      // Use the email from context, action, or enhanced bot session
      const effectiveEmail = customerContext.email || action.email;
      console.log('🛒 Fetching cart (draft orders) for customer:', effectiveEmail);
      
      // In Shopify, carts are essentially draft orders
      // We'll fetch recent draft orders for this customer
      const credentials = await shopifyService.getCredentials(this.organizationId);
      
      if (!credentials) {
        console.log('⚠️ No Shopify credentials - cart is empty');
        return { draft_orders: [] };
      }
      
      // Try to fetch with email if we have it, otherwise fetch all recent draft orders
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_getDraftOrders',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          customer_email: effectiveEmail
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.draft_orders) {
        console.log('✅ Found', data.draft_orders.length, 'draft orders (cart items)');
        return { draft_orders: data.draft_orders };
      }
      
      return { draft_orders: [] };
      
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { draft_orders: [] };
    }
  }
  
  /**
   * Handle Shopify product details - Search for specific product
   */
  async handleShopifyProductDetails(action) {
    try {
      console.log('📦 Fetching product details for:', action.query);
      
      // Extract product name from query
      const productQuery = action.query.toLowerCase()
        .replace(/tell me about|more info about|details about|what is/gi, '')
        .trim();
      
      console.log('🔍 Searching for product:', productQuery);
      
      // Search for the specific product
      let products = [];
      
      if (this.activeIntegrations.shopify) {
        products = await shopifyService.searchProducts(productQuery, this.organizationId);
      } else {
        products = demoShopifyService.searchDemoProducts(productQuery);
      }
      
      if (products && products.length > 0) {
        console.log('✅ Found product:', products[0].title);
        return { 
          products: [products[0]], // Return only the first/best match
          searchQuery: productQuery,
          found: true
        };
      }
      
      console.log('⚠️ No products found matching:', productQuery);
      // Return empty result, let chat intelligence handle "product not found" response
      return { products: [], searchQuery: productQuery, found: false };
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      return { products: [], searchQuery: action.query };
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
   * Refresh integration status (call after connecting a new integration)
   */
  async refreshIntegrations() {
    console.log('🔄 Refreshing integration status...');
    await this.initializeIntegrations();
    return this.getIntegrationStatus();
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


