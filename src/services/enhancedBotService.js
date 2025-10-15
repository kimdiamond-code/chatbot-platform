// Simple Enhanced Bot Service for Smart Responses
import { chatBotService } from './openaiService.js';
import { integrationOrchestrator } from './chat/integrationOrchestrator';

class EnhancedBotService {
  constructor() {
    this.state = {
      isEnabled: false,
      isInitialized: false,
      isInitializing: false,
      lastCheck: null,
      apiConnected: false,
      demoMode: false,
      demoReason: null,
      status: {
        shopify: { connected: false, error: null, demoMode: false },
        kustomer: { connected: false, error: null, demoMode: false },
        api: { connected: false, error: null }
      },
      error: null
    };
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
    this.initTimeout = null;
    this.retryDelay = 5000;
    this.initializeWithRetry();
  }

  async initializeWithRetry() {
    if (this.state.isInitialized || this.state.isInitializing) {
      return;
    }

    try {
      if (this.initializationAttempts >= this.maxInitAttempts) {
        console.warn('⚠️ Max initialization attempts reached, running in basic mode');
        this.state.error = 'Max initialization attempts reached';
        this.state.isInitialized = true;
        return;
      }

      this.state.isInitializing = true;
      this.initializationAttempts++;
      
      // Exponential backoff for retry delay
      const currentDelay = Math.min(this.retryDelay * Math.pow(2, this.initializationAttempts - 1), 30000);
      console.log(`🔄 Initializing enhanced bot (attempt ${this.initializationAttempts}/${this.maxInitAttempts}, delay: ${currentDelay}ms)...`);
      
      // Check API connection first
      const apiConnected = await this.checkApiConnection();
      if (!apiConnected) {
        throw new Error('API server not available - will retry');
      }
      
      // Give time for other services to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const integrationStatus = await this.checkIntegrations();
      
      if (integrationStatus.error) {
        throw new Error(integrationStatus.error);
      }
      
      // Update state based on integration check
      this.state.isEnabled = integrationStatus.isEnabled;
      this.state.status = integrationStatus.status;
      this.state.lastCheck = new Date().toISOString();
      
      if (!this.state.isEnabled && this.initializationAttempts < this.maxInitAttempts) {
        this.state.isInitializing = false;
        this.initTimeout = setTimeout(() => this.initializeWithRetry(), this.retryDelay);
      } else {
        this.state.isInitialized = true;
        this.state.isInitializing = false;
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.state.error = error.message;
      this.state.isInitializing = false;
      
      if (this.initializationAttempts < this.maxInitAttempts) {
        this.initTimeout = setTimeout(() => this.initializeWithRetry(), this.retryDelay);
      } else {
        this.state.isInitialized = true;
      }
    }
  }

  async checkApiConnection() {
    try {
      const response = await fetch('/api/consolidated?check=1');
      if (response.status === 503) {
        const data = await response.json();
        this.state.status.api = {
          connected: false,
          error: data.error,
          details: data.details,
          lastCheck: new Date().toISOString()
        };
        this.switchToDemoMode(data.error || 'API service unavailable');
        return false;
      }
      
      const connected = response.status === 200;
      this.state.status.api = {
        connected,
        error: connected ? null : `API returned status ${response.status}`,
        lastCheck: new Date().toISOString()
      };
      this.state.apiConnected = connected;
      if (!connected) {
        this.switchToDemoMode('API server not responding');
      }
      return connected;
    } catch (error) {
      this.state.status.api = {
        connected: false,
        error: `API connection failed: ${error.message}`,
        lastCheck: new Date().toISOString()
      };
      this.state.apiConnected = false;
      this.switchToDemoMode('API server connection error');
      return false;
    }
  }

  async checkIntegrations() {
    console.log('🔍 Checking integrations for enhanced bot...');
    
    try {
      // First check API connection
      const apiConnected = await this.checkApiConnection();
      if (!apiConnected) {
        console.log('⚠️ API server unavailable, operating in demo mode');
        return {
          isEnabled: false,
          demoMode: true,
          status: {
            shopify: { connected: false, demoMode: true, error: null },
            kustomer: { connected: false, demoMode: true, error: null },
            api: this.state.status.api
          }
        };
      }

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
          demoMode: status.shopify.demoMode || false,
          error: status.shopify.error || null,
          lastCheck: new Date().toISOString()
        },
        kustomer: {
          connected: status.kustomer.connected || false,
          demoMode: status.kustomer.demoMode || false,
          error: status.kustomer.error || null,
          lastCheck: new Date().toISOString()
        }
      };

      // Service is enabled if any integration is connected OR in demo mode
      const isEnabled = formattedStatus.shopify.connected || 
                       formattedStatus.shopify.demoMode || 
                       formattedStatus.kustomer.connected ||
                       formattedStatus.kustomer.demoMode;
      
      console.log('🤖 Enhanced bot service enabled:', isEnabled);
      console.log('🔗 Shopify:', this.getStatusEmoji(formattedStatus.shopify));
      console.log('🔗 Kustomer:', this.getStatusEmoji(formattedStatus.kustomer));
      
      return {
        isEnabled,
        status: formattedStatus,
        error: null,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Integration check failed:', error.message);
      return {
        isEnabled: false,
        status: {
          shopify: { connected: false, error: error.message },
          kustomer: { connected: false, error: error.message }
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
    console.log('🔄 Will automatically reconnect when API is available');
    
    this.state.isEnabled = false;
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

  getStatus() {
    return {
      ...this.state,
      initializationAttempts: this.initializationAttempts,
      maxInitAttempts: this.maxInitAttempts
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
   * Process a customer message and generate smart response
   */
  async processMessage(messageContent, conversationId, customerEmail = null) {
    console.log('🤖 Enhanced bot processing message:', messageContent);

    // ALWAYS try to give a response, even without integrations
    if (!this.isEnabled) {
      console.log('📝 Using standard OpenAI response (no integrations)');
      try {
        return await chatBotService.generateResponse(messageContent, conversationId);
      } catch (error) {
        console.error('❌ OpenAI fallback failed:', error);
        // Return basic fallback if OpenAI also fails
        return {
          response: "I'm here to help! Could you tell me more about what you need assistance with?",
          confidence: 0.5,
          source: 'fallback',
          shouldEscalate: false,
          metadata: {}
        };
      }
    }

    try {
      // Build customer context for integrations
      const customerContext = {
        email: customerEmail,
        conversationId: conversationId
      };

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
      // ALWAYS fallback to standard OpenAI
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

  /**
   * Get simple status for UI
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      integrations: integrationOrchestrator.getIntegrationStatus()
    };
  }
}

// Export singleton instance
export const enhancedBotService = new EnhancedBotService();
export default enhancedBotService;
