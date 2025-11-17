// Simple Enhanced Bot Service for Smart Responses
import { chatBotService } from './openaiService.js';
import { integrationOrchestrator } from './chat/integrationOrchestrator';
import { customerProfileService } from './customer/customerProfileService';

class EnhancedBotService {
  constructor() {
    this.state = {
      isEnabled: true,  // Enable by default
      isInitialized: true,  // Mark as initialized to prevent blocking
      isInitializing: false,
      lastCheck: null,
      apiConnected: true,  // Assume connected
      status: {
        shopify: { connected: false, error: null },
        kustomer: { connected: false, error: null },
        api: { connected: true, error: null }
      },
      error: null
    };
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
    this.initTimeout = null;
    this.retryDelay = 5000;
    // Store customer email for cart persistence
    this.customerSessions = new Map();
    // Initialize in background without blocking
    setTimeout(() => this.initializeWithRetry(), 1000);
  }

  async initializeWithRetry() {
    if (this.state.isInitializing) {
      return;
    }

    try {
      if (this.initializationAttempts >= this.maxInitAttempts) {
        console.warn('⚠️ Max initialization attempts reached, running in basic mode');
        this.state.error = 'Max initialization attempts reached';
        return;
      }

      this.state.isInitializing = true;
      this.initializationAttempts++;
      
      // Exponential backoff for retry delay
      const currentDelay = Math.min(this.retryDelay * Math.pow(2, this.initializationAttempts - 1), 30000);
      console.log(`🔄 Initializing enhanced bot (attempt ${this.initializationAttempts}/${this.maxInitAttempts}, delay: ${currentDelay}ms)...`);
      
      // Check API connection first
      const apiConnected = await this.checkApiConnection();
      
      // Give time for other services to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const integrationStatus = await this.checkIntegrations();
      
      if (integrationStatus.error) {
        console.warn('⚠️ Integration error:', integrationStatus.error);
      }

      // Update state based on results
      this.state = {
        ...this.state,
        isEnabled: this.state.isEnabled,
        isInitialized: true,
        isInitializing: false,
        apiConnected: apiConnected,
        lastCheck: new Date(),
        status: integrationStatus,
        error: integrationStatus.error || null
      };

      console.log('✅ Enhanced bot initialized:', {
        enabled: this.state.isEnabled,
        apiConnected: this.state.apiConnected,
        shopifyStatus: this.state.status.shopify.connected,
        kustomerStatus: this.state.status.kustomer.connected
      });

      return true;
    } catch (error) {
      console.error('❌ Enhanced bot initialization error:', error);
      this.state = {
        ...this.state,
        isInitialized: true, // Still mark as initialized to not block
        isInitializing: false,
        error: error.message || 'Initialization failed'
      };

      // Retry initialization if not max attempts
      if (this.initializationAttempts < this.maxInitAttempts) {
        const retryIn = Math.min(this.retryDelay * Math.pow(2, this.initializationAttempts), 30000);
        console.log(`⏰ Will retry initialization in ${retryIn}ms`);
        this.initTimeout = setTimeout(() => this.initializeWithRetry(), retryIn);
      }

      return false;
    }
  }

  async checkApiConnection() {
    try {
      // Simply return true since OpenAI API is handled in openaiService
      return true;
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  }

  async checkIntegrations() {
    const status = {
      shopify: { connected: false, error: null },
      kustomer: { connected: false, error: null },
      api: { connected: true, error: null }
    };

    // Check integrations - don't block on errors
    try {
      const { shopifyService } = await import('./integrations/shopifyService');
      status.shopify.connected = await shopifyService.verifyConnection();
    } catch (error) {
      status.shopify.error = 'Service check failed';
      console.warn('Shopify integration check failed:', error.message);
    }

    try {
      const { kustomerService } = await import('./integrations/kustomerService');
      status.kustomer.connected = await kustomerService.verifyConnection();
    } catch (error) {
      status.kustomer.error = 'Service check failed';
      console.warn('Kustomer integration check failed:', error.message);
    }

    return status;
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      enabled: this.state.isEnabled,
      initialized: this.state.isInitialized,
      initializing: this.state.isInitializing,
      apiConnected: this.state.apiConnected,
      lastCheck: this.state.lastCheck,
      status: this.state.status,
      error: this.state.error
    };
  }

  /**
   * Enable/disable service
   */
  setEnabled(enabled) {
    this.state.isEnabled = enabled;
    console.log(`Enhanced bot ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Store customer email for a conversation (for cart persistence across messages)
   */
  storeCustomerEmail(conversationId, email) {
    if (!conversationId || !email) return;
    
    this.customerSessions.set(conversationId, {
      email,
      timestamp: Date.now()
    });
    console.log(`📧 Stored customer email for conversation: ${email}`);
  }

  /**
   * Get stored customer email for a conversation
   */
  getCustomerEmail(conversationId) {
    if (!conversationId) return null;
    
    const session = this.customerSessions.get(conversationId);
    
    // Check if session exists and is less than 24 hours old
    if (session && (Date.now() - session.timestamp) < 24 * 60 * 60 * 1000) {
      return session.email;
    }
    
    // Clean up expired session
    if (session) {
      this.customerSessions.delete(conversationId);
    }
    
    return null;
  }

  /**
   * Clear stored customer data
   */
  clearCustomerSession(conversationId) {
    if (conversationId) {
      this.customerSessions.delete(conversationId);
      console.log(`🗑️ Cleared customer session for conversation: ${conversationId}`);
    }
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [conversationId, session] of this.customerSessions.entries()) {
      if (now - session.timestamp > maxAge) {
        this.customerSessions.delete(conversationId);
      }
    }
  }

  /**
   * Process a customer message and generate smart response
   * ✅ MULTI-TENANT FIX: Now accepts organizationId parameter
   */
  async processMessage(messageContent, conversationId, customerEmail = null, organizationId = null) {
    console.log('🤖 Enhanced bot processing message:', messageContent);
    console.log('🏛️ Organization ID:', organizationId);

    try {
      // Get stored email if not provided
      let effectiveEmail = customerEmail || this.getCustomerEmail(conversationId);
      
      // Extract email from message if present
      const emailMatch = messageContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatch && emailMatch.length > 0) {
        effectiveEmail = emailMatch[0];
        console.log('📧 Extracted email from message:', effectiveEmail);
        // Store it for future use
        this.storeCustomerEmail(conversationId, effectiveEmail);
      }

      // ✅ FIX: Use organization-specific customer profile
      let customerProfile = null;
      if (effectiveEmail) {
        customerProfile = await customerProfileService.getOrCreateProfile(
          effectiveEmail,
          organizationId || '00000000-0000-0000-0000-000000000001'
        );
        console.log('👤 Customer profile loaded:', {
          email: effectiveEmail,
          visitCount: customerProfile?.metadata?.visitCount,
          isReturning: (customerProfile?.metadata?.visitCount || 0) > 1
        });
      }

      // Build customer context for integrations with extracted email and profile
      const customerContext = {
        email: effectiveEmail,
        conversationId: conversationId,
        profile: customerProfile
      };

      console.log('👤 Customer context:', customerContext);

      // Process through integration orchestrator
      const smartResult = await integrationOrchestrator.processMessage(
        {
          content: messageContent,
          conversation_id: conversationId,
          sender_type: 'user'
        },
        customerContext
      );

      console.log('🎯 Smart processing result:', smartResult.response?.metadata?.source);

      // Check if the response needs email information
      if (smartResult.response?.metadata?.needsInfo === 'email' && effectiveEmail) {
        console.log('📧 Response needs email, but we have it! Re-processing...');
        // Re-process with the email we have
        const retryResult = await integrationOrchestrator.processMessage(
          {
            content: messageContent + ' ' + effectiveEmail,
            conversation_id: conversationId,
            sender_type: 'user'
          },
          customerContext
        );
        
        if (retryResult.response?.text && !retryResult.response.text.includes('need') && 
            !retryResult.response.text.includes('provide')) {
          return {
            response: retryResult.response.text,
            confidence: retryResult.response.metadata.confidence,
            source: 'smart_integration',
            actions: retryResult.response.actions || [],
            shouldEscalate: retryResult.analysis?.requiresEscalation || false,
            metadata: retryResult.response.metadata
          };
        }
      }

      // If we got a good smart response, use it
      // FOR PRODUCTS: Always use smart integration response if we have products
      const hasProducts = smartResult.response?.metadata?.products?.length > 0;
      const isHighConfidence = smartResult.response?.metadata?.confidence > 0.5; // Lowered from 0.7
      const hasIntegrationData = smartResult.integrationResults?.shopify?.orders?.length > 0 || hasProducts;
      
      if (smartResult.response?.text && (hasProducts || hasIntegrationData)) {
        console.log('✅ Using smart integration response', {
          confidence: smartResult.response.metadata.confidence,
          hasProducts,
          hasIntegrationData
        });
        return {
          response: smartResult.response.text,
          confidence: smartResult.response.metadata.confidence,
          source: 'smart_integration',
          actions: smartResult.response.actions || [],
          shouldEscalate: smartResult.analysis?.requiresEscalation || false,
          metadata: smartResult.response.metadata
        };
      }

      // Otherwise, enhance OpenAI with integration context
      console.log('🤖 Enhancing OpenAI with integration context');
      
      // ✅ MULTI-TENANT FIX: Pass actual organization ID to OpenAI
      const aiResult = await chatBotService.generateResponse(
        messageContent, 
        conversationId,
        {
          organizationId: organizationId || '00000000-0000-0000-0000-000000000001',
          email: effectiveEmail,
          profile: customerProfile
        }
      );
      
      // Add any available actions from integrations
      if (smartResult.response?.actions?.length > 0) {
        aiResult.actions = smartResult.response.actions;
        aiResult.metadata = {
          ...aiResult.metadata,
          hasIntegrationActions: true
        };
      }

      return aiResult;

    } catch (error) {
      console.error('❌ Enhanced bot processing error:', error);
      // ALWAYS fallback to standard OpenAI or basic response
      try {
        // ✅ MULTI-TENANT FIX: Pass organization ID even in fallback
        return await chatBotService.generateResponse(
          messageContent, 
          conversationId,
          {
            organizationId: organizationId || '00000000-0000-0000-0000-000000000001'
          }
        );
      } catch (fallbackError) {
        console.error('❌ OpenAI fallback also failed:', fallbackError);
        // Final fallback - basic response
        return {
          response: "I'm here to help! Could you tell me more about what you need assistance with?",
          confidence: 0.5,
          source: 'fallback',
          shouldEscalate: false,
          metadata: {}
        };
      }
    }
  }

  /**
   * Check if this looks like a customer message that should get smart processing
   */
  shouldProcessMessage(senderType, messageContent) {
    // Process user messages (customers)
    if (senderType === 'user' || senderType === 'customer') {
      return true;
    }
    
    // Don't process bot or agent messages
    if (senderType === 'bot' || senderType === 'agent' || senderType === 'system') {
      return false;
    }
    
    // Default: process the message
    return true;
  }

  /**
   * Force refresh of integration status
   */
  async refreshIntegrations() {
    console.log('🔄 Refreshing integration status...');
    const newStatus = await this.checkIntegrations();
    this.state.status = newStatus;
    this.state.lastCheck = new Date();
    return newStatus;
  }
}

// Export singleton instance
export const enhancedBotService = new EnhancedBotService();
export default enhancedBotService;
