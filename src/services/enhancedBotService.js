// Simple Enhanced Bot Service for Smart Responses
import { chatBotService } from './openaiService.js';
import { integrationOrchestrator } from './chat/integrationOrchestrator';

class EnhancedBotService {
  constructor() {
    this.state = {
      isEnabled: true,  // Enable by default to fix the issue
      isInitialized: true,  // Mark as initialized to prevent blocking
      isInitializing: false,
      lastCheck: null,
      apiConnected: true,  // Assume connected
      demoMode: false,
      demoReason: null,
      status: {
        shopify: { connected: false, error: null, demoMode: true },
        kustomer: { connected: false, error: null, demoMode: true },
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
      
      // Update state based on integration check
      this.state.status = integrationStatus.status;
      this.state.lastCheck = new Date().toISOString();
      this.state.isInitializing = false;
      
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.state.error = error.message;
      this.state.isInitializing = false;
      
      if (this.initializationAttempts < this.maxInitAttempts) {
        this.initTimeout = setTimeout(() => this.initializeWithRetry(), this.retryDelay);
      }
    }
  }

  async checkApiConnection() {
    try {
      const response = await fetch('/api/consolidated', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const connected = response.ok;
      this.state.status.api = {
        connected,
        error: connected ? null : `API returned status ${response.status}`,
        lastCheck: new Date().toISOString()
      };
      this.state.apiConnected = connected;
      
      if (!connected && response.status !== 400) {
        this.switchToDemoMode('API server not responding');
      }
      
      return connected;
    } catch (error) {
      console.warn('⚠️ API check failed:', error.message);
      // Don't fail completely, just note the issue
      this.state.status.api = {
        connected: false,
        error: `API connection check failed: ${error.message}`,
        lastCheck: new Date().toISOString()
      };
      return false;
    }
  }

  async checkIntegrations() {
    console.log('🔍 Checking integrations for enhanced bot...');
    
    try {
      // Check if integrations are available with timeout
      const status = await Promise.race([
        integrationOrchestrator.getIntegrationStatus(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Integration check timeout')), 5000)
        )
      ]);

      // Format integration status with detailed state
      const formattedStatus = {
        shopify: {
          connected: status.shopify.connected || false,
          demoMode: status.shopify.demoMode !== false,  // Default to demo mode
          error: status.shopify.error || null,
          lastCheck: new Date().toISOString()
        },
        kustomer: {
          connected: status.kustomer.connected || false,
          demoMode: status.kustomer.demoMode !== false,  // Default to demo mode
          error: status.kustomer.error || null,
          lastCheck: new Date().toISOString()
        },
        api: this.state.status.api
      };
      
      console.log('🤖 Enhanced bot service status check complete');
      console.log('🔗 Shopify:', this.getStatusEmoji(formattedStatus.shopify));
      console.log('🔗 Kustomer:', this.getStatusEmoji(formattedStatus.kustomer));
      
      return {
        isEnabled: true,  // Always enabled
        status: formattedStatus,
        error: null,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Integration check failed:', error.message);
      // Return demo mode status on error
      return {
        isEnabled: true,
        status: {
          shopify: { connected: false, demoMode: true, error: error.message },
          kustomer: { connected: false, demoMode: true, error: error.message },
          api: this.state.status.api
        },
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  switchToDemoMode(reason) {
    console.log('🎭 Enhanced Bot Demo Mode');
    console.log(`⚠️ Reason: ${reason}`);
    console.log('📝 All integrations will simulate responses');
    
    this.state.demoMode = true;
    this.state.demoReason = reason;
    this.state.status = {
      ...this.state.status,
      shopify: { connected: false, demoMode: true, error: null },
      kustomer: { connected: false, demoMode: true, error: null }
    };
  }

  getStatusEmoji(integration) {
    if (integration.connected) return '✅ connected';
    if (integration.demoMode) return '🎭 demo mode';
    if (integration.error) return `❌ error: ${integration.error}`;
    if (integration.initializing) return '🔄 initializing';
    return '❌ disconnected';
  }

  /**
   * Get simple status for UI
   */
  getStatus() {
    return {
      ...this.state,
      enabled: true,  // Always show as enabled
      initializationAttempts: this.initializationAttempts,
      maxInitAttempts: this.maxInitAttempts,
      integrations: integrationOrchestrator.getIntegrationStatus()
    };
  }

  // Clean up on unmount/shutdown
  cleanup() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
    this.state.isInitializing = false;
  }
  
  /**
   * Manually refresh integration status (call after connecting Shopify)
   */
  async refreshIntegrations() {
    console.log('🔄 Refreshing enhanced bot integrations...');
    await integrationOrchestrator.refreshIntegrations();
    await this.checkIntegrations();
    return this.getStatus();
  }

  /**
   * Store customer email for session (for cart persistence)
   */
  storeCustomerEmail(conversationId, email) {
    if (email && email !== 'null' && email !== 'undefined') {
      console.log('📧 Storing customer email for session:', { conversationId, email });
      this.customerSessions.set(conversationId, { email, lastUpdated: Date.now() });
    }
  }

  /**
   * Get stored customer email for conversation
   */
  getCustomerEmail(conversationId) {
    const session = this.customerSessions.get(conversationId);
    if (session && session.email) {
      console.log('📧 Retrieved stored customer email:', session.email);
      return session.email;
    }
    return null;
  }

  /**
   * Process a customer message and generate smart response
   */
  async processMessage(messageContent, conversationId, customerEmail = null) {
    console.log('🤖 Enhanced bot processing message:', messageContent);

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

      // Build customer context for integrations with extracted email
      const customerContext = {
        email: effectiveEmail,
        conversationId: conversationId
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
      if (smartResult.response?.text && smartResult.response.metadata?.confidence > 0.7) {
        console.log('✅ Using smart integration response');
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
      const aiResult = await chatBotService.generateResponse(messageContent, conversationId);
      
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
        return await chatBotService.generateResponse(messageContent, conversationId);
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
    if (senderType === 'user') {
      return true;
    }

    // Don't process agent messages
    if (senderType === 'agent') {
      return false;
    }

    // For unclear sender types, check content
    const lowerContent = messageContent.toLowerCase();
    const customerKeywords = [
      'order', 'track', 'where is', 'status', 'help', 'problem', 
      'issue', 'return', 'refund', 'cancel', 'billing', 'charge'
    ];

    return customerKeywords.some(keyword => lowerContent.includes(keyword));
  }
}

// Export singleton instance
export const enhancedBotService = new EnhancedBotService();
export default enhancedBotService;