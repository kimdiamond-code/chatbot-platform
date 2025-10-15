// Smart Message Service - Connects chat interface to integration orchestrator
import { messageService } from './api';
import { integrationOrchestrator } from './chat/integrationOrchestrator';
import { chatBotService } from './openaiService.js';

class SmartMessageService {
  constructor() {
    this.conversationContexts = new Map();
    this.botConfigs = new Map();
  }

  /**
   * Process incoming customer message and generate smart bot response
   */
  async processCustomerMessage(messageData, organizationId) {
    console.log('🧠 SmartMessageService: Processing customer message:', messageData.content);
    
    try {
      // 1. Save the customer message first
      const { data: savedMessage, error: saveError } = await messageService.send(messageData);
      
      if (saveError) {
        console.error('❌ Error saving customer message:', saveError);
        return { error: saveError };
      }

      console.log('✅ Customer message saved:', savedMessage.id);

      // 2. Get or build customer context
      const customerContext = await this.getCustomerContext(
        messageData.conversation_id,
        messageData.customer_email || null
      );

      console.log('📊 Customer context retrieved:', {
        hasShopifyData: !!customerContext.shopify,
        hasKustomerData: !!customerContext.kustomer,
        email: customerContext.email
      });

      // 3. Process through integration orchestrator for smart responses
      const smartResult = await integrationOrchestrator.processMessage(
        {
          content: messageData.content,
          conversation_id: messageData.conversation_id,
          sender_type: 'user'
        },
        customerContext
      );

      console.log('🎯 Smart processing result:', {
        hasResponse: !!smartResult.response,
        source: smartResult.response?.metadata?.source,
        integrationsUsed: smartResult.response?.metadata?.integrationsUsed
      });

      // 4. Generate AI-enhanced response if needed
      let finalResponse = smartResult.response;
      
      // If integration didn't provide a comprehensive response, enhance with OpenAI
      if (!finalResponse.text || finalResponse.metadata?.confidence < 0.7) {
        console.log('🤖 Enhancing response with OpenAI...');
        
        const aiResult = await chatBotService.generateResponse(
          messageData.content,
          messageData.conversation_id,
          this.botConfigs.get(organizationId)
        );

        // Combine AI response with integration insights
        finalResponse = this.combineResponses(smartResult.response, aiResult, smartResult.integrationResults);
      }

      // 5. Save bot response to database
      const botMessage = {
        conversation_id: messageData.conversation_id,
        content: finalResponse.text,
        sender_type: 'bot',
        message_type: 'smart_response',
        metadata: {
          ...finalResponse.metadata,
          analysis: smartResult.analysis,
          actions: finalResponse.actions,
          customer_context: customerContext
        }
      };

      const { data: botResponse, error: botError } = await messageService.send(botMessage);
      
      if (botError) {
        console.error('❌ Error saving bot response:', botError);
        return { error: botError };
      }

      console.log('✅ Smart bot response saved:', botResponse.id);

      // 6. Update conversation context
      this.updateConversationContext(messageData.conversation_id, {
        lastMessage: savedMessage,
        lastBotResponse: botResponse,
        customerContext: smartResult.customerContext,
        integrationResults: smartResult.integrationResults
      });

      // 7. Check if escalation is needed
      if (smartResult.analysis?.requiresEscalation || finalResponse.metadata?.shouldEscalate) {
        await this.handleEscalation(messageData.conversation_id, smartResult.analysis);
      }

      return {
        customerMessage: savedMessage,
        botResponse: botResponse,
        analysis: smartResult.analysis,
        integrationResults: smartResult.integrationResults,
        escalated: smartResult.analysis?.requiresEscalation || false
      };

    } catch (error) {
      console.error('❌ SmartMessageService error:', error);
      
      // Fallback: save customer message and basic bot response
      try {
        const fallbackResponse = await this.createFallbackResponse(messageData);
        return { 
          customerMessage: fallbackResponse.customerMessage,
          botResponse: fallbackResponse.botResponse,
          error: error.message 
        };
      } catch (fallbackError) {
        console.error('❌ Fallback response failed:', fallbackError);
        return { error: fallbackError.message };
      }
    }
  }

  /**
   * Get comprehensive customer context from all available sources
   */
  async getCustomerContext(conversationId, customerEmail = null) {
    console.log('📊 Building customer context for:', conversationId);
    
    try {
      // Get existing conversation context
      let context = this.conversationContexts.get(conversationId) || {
        conversationId,
        email: customerEmail,
        chatHistory: [],
        lastUpdated: null
      };

      // Get enriched context from integration orchestrator
      if (customerEmail) {
        const enrichedContext = await integrationOrchestrator.getCustomerContext(
          customerEmail, 
          conversationId
        );
        context = { ...context, ...enrichedContext };
      }

      // Get recent chat history if not available
      if (!context.chatHistory?.length) {
        try {
          const { data: recentMessages } = await messageService.getMessages(conversationId, 1, 10);
          context.chatHistory = recentMessages || [];
        } catch (error) {
          console.log('⚠️ Could not fetch chat history:', error.message);
        }
      }

      this.conversationContexts.set(conversationId, context);
      return context;

    } catch (error) {
      console.error('❌ Error building customer context:', error);
      return {
        conversationId,
        email: customerEmail,
        chatHistory: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Combine integration and AI responses intelligently
   */
  combineResponses(integrationResponse, aiResult, integrationResults) {
    console.log('🔄 Combining responses...');
    
    // If integration response is comprehensive, use it
    if (integrationResponse?.text && integrationResponse.metadata?.confidence > 0.8) {
      console.log('✅ Using comprehensive integration response');
      return integrationResponse;
    }

    // If AI has good response but integration has actions, combine them
    if (aiResult?.response && integrationResponse?.actions?.length > 0) {
      console.log('🔀 Combining AI response with integration actions');
      return {
        text: aiResult.response,
        actions: integrationResponse.actions,
        metadata: {
          source: 'ai_plus_integrations',
          confidence: Math.max(aiResult.confidence || 0.7, integrationResponse.metadata?.confidence || 0.5),
          integrationsUsed: integrationResponse.metadata?.integrationsUsed || [],
          knowledgeUsed: aiResult.knowledgeUsed || false,
          shouldEscalate: aiResult.shouldEscalate || integrationResponse.metadata?.shouldEscalate || false
        }
      };
    }

    // If integration has data but poor response, let AI use the context
    if (integrationResults && (integrationResults.shopify || integrationResults.kustomer)) {
      console.log('🤖 Using AI response with integration context');
      let enhancedText = aiResult?.response || "I'm here to help you.";
      
      // Add integration context hints
      if (integrationResults.shopify?.orders?.length > 0) {
        enhancedText += "\n\nI can help you with order tracking and product information.";
      }
      if (integrationResults.kustomer) {
        enhancedText += "\n\nI can also connect you with our support team if needed.";
      }

      return {
        text: enhancedText,
        actions: integrationResponse?.actions || [],
        metadata: {
          source: 'ai_with_integration_context',
          confidence: (aiResult?.confidence || 0.7) + 0.1, // Slight boost for context
          integrationsUsed: integrationResponse?.metadata?.integrationsUsed || [],
          knowledgeUsed: aiResult?.knowledgeUsed || false,
          shouldEscalate: aiResult?.shouldEscalate || false
        }
      };
    }

    // Fallback to AI response
    console.log('🤖 Using AI response as fallback');
    return {
      text: aiResult?.response || "Thank you for your message. How can I assist you today?",
      actions: [],
      metadata: {
        source: aiResult?.source || 'fallback',
        confidence: aiResult?.confidence || 0.6,
        integrationsUsed: [],
        knowledgeUsed: aiResult?.knowledgeUsed || false,
        shouldEscalate: aiResult?.shouldEscalate || false
      }
    };
  }

  /**
   * Create fallback response when smart processing fails
   */
  async createFallbackResponse(messageData) {
    console.log('🔄 Creating fallback response...');
    
    // Save customer message
    const { data: customerMessage } = await messageService.send(messageData);
    
    // Create simple bot response
    const botMessage = {
      conversation_id: messageData.conversation_id,
      content: "Thank you for your message! I'm experiencing a brief technical issue, but I'm here to help. A team member will be with you shortly.",
      sender_type: 'bot',
      message_type: 'fallback',
      metadata: {
        source: 'fallback',
        confidence: 0.5,
        requiresEscalation: true
      }
    };

    const { data: botResponse } = await messageService.send(botMessage);
    
    return { customerMessage, botResponse };
  }

  /**
   * Handle escalation to human agent
   */
  async handleEscalation(conversationId, analysis) {
    console.log('🚀 Handling escalation for conversation:', conversationId);
    
    try {
      // Update conversation status to require human attention
      const { conversationService } = await import('./api');
      
      await conversationService.update(conversationId, {
        status: 'escalated',
        priority: analysis?.priority || 'high',
        escalation_reason: analysis?.requiresEscalation ? 'automatic_sentiment_analysis' : 'customer_request',
        escalated_at: new Date().toISOString()
      });

      console.log('✅ Conversation escalated successfully');
      
      // Could add notification service here
      // await notificationService.createNotification({...});
      
    } catch (error) {
      console.error('❌ Error handling escalation:', error);
    }
  }

  /**
   * Update conversation context cache
   */
  updateConversationContext(conversationId, updates) {
    const existing = this.conversationContexts.get(conversationId) || {};
    this.conversationContexts.set(conversationId, {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString()
    });
  }

  /**
   * Set bot configuration for organization
   */
  setBotConfig(organizationId, config) {
    this.botConfigs.set(organizationId, config);
    console.log('⚙️ Bot config updated for org:', organizationId);
  }

  /**
   * Process agent message (no smart processing needed)
   */
  async processAgentMessage(messageData) {
    console.log('👤 Processing agent message...');
    
    // Just save agent messages normally
    const result = await messageService.send(messageData);
    
    // Update conversation context
    if (result.data) {
      this.updateConversationContext(messageData.conversation_id, {
        lastAgentMessage: result.data,
        agentActive: true
      });
    }
    
    return result;
  }

  /**
   * Clear conversation context (for privacy/cleanup)
   */
  clearConversationContext(conversationId) {
    this.conversationContexts.delete(conversationId);
    console.log('🧹 Cleared context for conversation:', conversationId);
  }

  /**
   * Get integration status for debugging
   */
  getSystemStatus() {
    const integrationStatus = integrationOrchestrator.getIntegrationStatus();
    
    return {
      integrations: integrationStatus,
      activeConversations: this.conversationContexts.size,
      botConfigs: this.botConfigs.size,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const smartMessageService = new SmartMessageService();
export default smartMessageService;
