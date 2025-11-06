// Training Service - Manages AI Training Data
// Stores and retrieves training conversations for bot improvement

import databaseService from './databaseService.js';

class TrainingService {
  constructor() {
    this.trainingData = [];
    this.initialized = false;
  }

  /**
   * Mark conversations for training
   */
  async markConversationsForTraining(conversationIds) {
    try {
      console.log('📚 Marking conversations for training:', conversationIds);

      // Fetch conversations from database
      const conversations = await databaseService.getConversations();
      const selectedConvs = conversations.filter(c => conversationIds.includes(c.id));

      // Fetch messages for each conversation
      const trainingExamples = [];
      for (const conv of selectedConvs) {
        const messages = await databaseService.getMessages(conv.id);
        if (messages.length > 0) {
          trainingExamples.push({
            conversationId: conv.id,
            customerName: conv.customer_name,
            customerEmail: conv.customer_email,
            messages: messages
          });
        }
      }

      this.trainingData = trainingExamples;
      this.initialized = true;

      console.log(`✅ Loaded ${trainingExamples.length} conversations for training`);
      return {
        success: true,
        count: trainingExamples.length,
        examples: trainingExamples.length
      };
    } catch (error) {
      console.error('❌ Failed to mark conversations for training:', error);
      throw error;
    }
  }

  /**
   * Get training examples formatted for bot context
   */
  getTrainingContext() {
    if (!this.initialized || this.trainingData.length === 0) {
      return '';
    }

    // Format training examples for the system prompt
    let context = '\n\n📚 TRAINING EXAMPLES (Learn from these real conversations):\n\n';

    // Take up to 5 most relevant examples
    const examples = this.trainingData.slice(0, 5);

    examples.forEach((example, index) => {
      context += `Example ${index + 1}:\n`;
      
      // Show conversation flow
      example.messages.slice(0, 6).forEach(msg => {
        if (msg.sender_type === 'user') {
          context += `Customer: ${msg.content}\n`;
        } else if (msg.sender_type === 'bot') {
          context += `Bot: ${msg.content}\n`;
        }
      });
      
      context += '\n---\n\n';
    });

    context += 'Use these examples to understand the tone, style, and type of responses customers expect.\n\n';

    return context;
  }

  /**
   * Get training statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      trainingExamplesCount: this.trainingData.length,
      totalMessages: this.trainingData.reduce((sum, ex) => sum + ex.messages.length, 0)
    };
  }

  /**
   * Clear training data
   */
  clearTraining() {
    this.trainingData = [];
    this.initialized = false;
    console.log('🧹 Training data cleared');
  }

  /**
   * Get all training conversation IDs
   */
  getTrainingConversationIds() {
    return this.trainingData.map(ex => ex.conversationId);
  }

  /**
   * Check if conversation is used for training
   */
  isConversationInTraining(conversationId) {
    return this.trainingData.some(ex => ex.conversationId === conversationId);
  }
}

// Create singleton instance
const trainingService = new TrainingService();

// Make available in browser for debugging
if (typeof window !== 'undefined') {
  window.trainingService = trainingService;
}

export default trainingService;
