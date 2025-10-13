// Simple Enhanced Bot Service for Smart Responses
import { chatBotService } from './openaiService';
import { integrationOrchestrator } from './chat/integrationOrchestrator';

class EnhancedBotService {
  constructor() {
    this.isEnabled = false;
    this.lastCheck = null;
    // Don't check immediately - let integrations initialize first
    setTimeout(() => this.checkIntegrations(), 2000);
  }

  async checkIntegrations() {
    console.log('🔍 Checking integrations for enhanced bot...');
    
    // Check if integrations are available
    const status = integrationOrchestrator.getIntegrationStatus();
    this.isEnabled = status.shopify.connected || status.kustomer.connected;
    this.lastCheck = new Date().toISOString();
    
    console.log('🤖 Enhanced bot service enabled:', this.isEnabled);
    console.log('🔗 Shopify:', status.shopify.connected ? '✅ connected' : '🎭 demo mode');
    console.log('🔗 Kustomer:', status.kustomer.connected ? '✅ connected' : '❌ disconnected');
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
