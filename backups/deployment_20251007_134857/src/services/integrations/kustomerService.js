// Kustomer Integration Service
class KustomerService {
  constructor() {
    this.config = this.loadConfig();
    this.baseUrl = null;
    this.headers = null;
    this.initializeConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('kustomer_config');
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfig() {
    if (this.config && this.config.status === 'connected') {
      this.baseUrl = `https://${this.config.subdomain}.api.kustomerapp.com/v1`;
      this.headers = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      };
    }
  }

  isConnected() {
    return this.config && this.config.status === 'connected';
  }

  // Customer Methods
  async findCustomer(email) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      // Mock customer data for demo
      const mockCustomer = {
        id: 'customer_123456789',
        type: 'customer',
        attributes: {
          emails: [{ email: email, verified: true }],
          name: 'John Doe',
          phones: [{ phone: '+1234567890' }],
          createdAt: '2023-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          tags: ['vip', 'loyal-customer'],
          loyaltyLevel: 'gold',
          totalSpent: 1299.95,
          totalOrders: 8,
          lastOrderAt: '2024-01-15T10:30:00.000Z',
          timezone: 'America/New_York'
        },
        relationships: {
          organization: {
            data: { type: 'org', id: this.config.organizationId }
          }
        }
      };

      return mockCustomer;
    } catch (error) {
      console.error('Error finding customer:', error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const newCustomer = {
        id: `customer_${Date.now()}`,
        type: 'customer',
        attributes: {
          emails: [{ email: customerData.email, verified: false }],
          name: customerData.name || 'Anonymous',
          phones: customerData.phone ? [{ phone: customerData.phone }] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['chat-customer'],
          source: 'chatbot'
        },
        relationships: {
          organization: {
            data: { type: 'org', id: this.config.organizationId }
          }
        }
      };

      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Conversation Methods
  async createConversation(customerId, initialMessage, metadata = {}) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const conversation = {
        id: `conversation_${Date.now()}`,
        type: 'conversation',
        attributes: {
          subject: 'Chat Conversation',
          status: 'open',
          priority: this.config.defaultPriority || 'medium',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['chatbot-conversation'],
          metadata: {
            source: 'chatbot',
            platform: 'web',
            ...metadata
          }
        },
        relationships: {
          customer: {
            data: { type: 'customer', id: customerId }
          },
          organization: {
            data: { type: 'org', id: this.config.organizationId }
          },
          assignedTeam: this.config.defaultTeam ? {
            data: { type: 'team', id: this.config.defaultTeam }
          } : null
        }
      };

      // Add initial message if provided
      if (initialMessage) {
        await this.addMessage(conversation.id, initialMessage, 'customer');
      }

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const mockConversation = {
        id: conversationId,
        type: 'conversation',
        attributes: {
          subject: 'Chat Conversation',
          status: 'open',
          priority: 'medium',
          channel: 'chat',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:35:00.000Z',
          tags: ['chatbot-conversation']
        }
      };

      return mockConversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async updateConversationStatus(conversationId, status, notes = '') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const updatedConversation = {
        id: conversationId,
        type: 'conversation',
        attributes: {
          status: status,
          updatedAt: new Date().toISOString(),
          notes: notes
        }
      };

      return updatedConversation;
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  // Message Methods
  async addMessage(conversationId, content, direction = 'in', messageType = 'chat') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const message = {
        id: `message_${Date.now()}`,
        type: 'message',
        attributes: {
          body: content,
          direction: direction, // 'in' for customer, 'out' for agent
          channel: 'chat',
          messageType: messageType,
          createdAt: new Date().toISOString(),
          status: 'sent',
          source: 'chatbot'
        },
        relationships: {
          conversation: {
            data: { type: 'conversation', id: conversationId }
          }
        }
      };

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async getMessages(conversationId, limit = 50) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const mockMessages = [
        {
          id: 'message_1',
          type: 'message',
          attributes: {
            body: 'Hello, I need help with my account',
            direction: 'in',
            channel: 'chat',
            createdAt: '2024-01-15T10:30:00.000Z',
            status: 'sent'
          }
        },
        {
          id: 'message_2',
          type: 'message',
          attributes: {
            body: 'Hi! I\'d be happy to help you with your account. What specific issue are you experiencing?',
            direction: 'out',
            channel: 'chat',
            createdAt: '2024-01-15T10:31:00.000Z',
            status: 'sent'
          }
        }
      ];

      return mockMessages.slice(0, limit);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Ticket Methods
  async createTicket(customerId, conversationId, subject, description, priority = null) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const ticket = {
        id: `ticket_${Date.now()}`,
        type: 'conversation',
        attributes: {
          subject: subject,
          status: 'open',
          priority: priority || this.config.defaultPriority || 'medium',
          channel: 'email', // Tickets are typically email channel in Kustomer
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['escalated-from-chat'],
          source: 'chatbot-escalation',
          description: description
        },
        relationships: {
          customer: {
            data: { type: 'customer', id: customerId }
          },
          parentConversation: conversationId ? {
            data: { type: 'conversation', id: conversationId }
          } : null,
          assignedTeam: this.config.defaultTeam ? {
            data: { type: 'team', id: this.config.defaultTeam }
          } : null
        }
      };

      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Search Methods
  async searchCustomers(query, limit = 10) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      // Mock search results
      const mockResults = [
        {
          id: 'customer_123456789',
          type: 'customer',
          attributes: {
            emails: [{ email: 'john@example.com', verified: true }],
            name: 'John Doe',
            phones: [{ phone: '+1234567890' }]
          }
        }
      ].filter(customer => 
        customer.attributes.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.attributes.emails.some(email => 
          email.email.toLowerCase().includes(query.toLowerCase())
        )
      );

      return mockResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Analytics Methods
  async getCustomerInsights(customerId) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const insights = {
        customerId: customerId,
        totalConversations: 12,
        averageResponseTime: '2h 15m',
        satisfactionScore: 4.2,
        tags: ['vip', 'loyal-customer', 'tech-savvy'],
        lastContact: '2024-01-15T10:30:00.000Z',
        preferredChannel: 'chat',
        timezone: 'America/New_York',
        conversationHistory: [
          {
            id: 'conv_1',
            subject: 'Billing Question',
            status: 'closed',
            createdAt: '2024-01-10T09:00:00.000Z',
            resolvedAt: '2024-01-10T09:15:00.000Z',
            satisfaction: 5
          },
          {
            id: 'conv_2',
            subject: 'Product Support',
            status: 'closed',
            createdAt: '2024-01-08T14:30:00.000Z',
            resolvedAt: '2024-01-08T15:00:00.000Z',
            satisfaction: 4
          }
        ]
      };

      return insights;
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      throw error;
    }
  }

  // Chat Integration Methods
  async escalateToHuman(conversationId, customerId, reason = '', chatHistory = []) {
    if (!this.isConnected()) {
      return null;
    }

    try {
      // Create a ticket for escalation
      const subject = `Chat Escalation - ${reason || 'Customer Request'}`;
      const description = `Customer requested human assistance.\n\nReason: ${reason}\n\nChat History:\n${
        chatHistory.map(msg => 
          `${msg.sender_type === 'user' ? 'Customer' : 'Bot'}: ${msg.content}`
        ).join('\n')
      }`;

      const ticket = await this.createTicket(
        customerId,
        conversationId,
        subject,
        description,
        'high'
      );

      // Update the conversation status
      await this.updateConversationStatus(
        conversationId,
        'pending',
        'Escalated to human agent'
      );

      return {
        ticketId: ticket.id,
        escalatedAt: new Date().toISOString(),
        reason: reason,
        status: 'escalated'
      };
    } catch (error) {
      console.error('Error escalating to human:', error);
      throw error;
    }
  }

  async syncChatConversation(chatConversation, messages) {
    if (!this.isConnected() || !this.config.enableConversationSync) {
      return null;
    }

    try {
      let customer = null;
      
      // Find or create customer
      if (chatConversation.customer?.email) {
        try {
          customer = await this.findCustomer(chatConversation.customer.email);
        } catch (error) {
          // Customer not found, create new one
          customer = await this.createCustomer({
            email: chatConversation.customer.email,
            name: chatConversation.customer.name
          });
        }
      }

      if (!customer) {
        throw new Error('Unable to find or create customer');
      }

      // Create conversation in Kustomer
      const kustomerConversation = await this.createConversation(
        customer.id,
        null,
        {
          chatConversationId: chatConversation.id,
          platform: 'web-chat',
          widget: true
        }
      );

      // Sync messages
      for (const message of messages) {
        const direction = message.sender_type === 'user' ? 'in' : 'out';
        await this.addMessage(
          kustomerConversation.id,
          message.content,
          direction
        );
      }

      return {
        kustomerConversationId: kustomerConversation.id,
        customerId: customer.id,
        syncedAt: new Date().toISOString(),
        messageCount: messages.length
      };
    } catch (error) {
      console.error('Error syncing chat conversation:', error);
      throw error;
    }
  }

  // Utility Methods
  formatCustomerName(customer) {
    if (customer.attributes.name) {
      return customer.attributes.name;
    }
    
    const email = customer.attributes.emails?.[0]?.email;
    return email ? email.split('@')[0] : 'Unknown Customer';
  }

  formatPriority(priority) {
    const priorityMap = {
      'low': 'Low Priority',
      'medium': 'Medium Priority', 
      'high': 'High Priority',
      'urgent': 'Urgent'
    };
    
    return priorityMap[priority] || priority;
  }

  formatStatus(status) {
    const statusMap = {
      'open': 'Open',
      'pending': 'Pending',
      'closed': 'Closed',
      'resolved': 'Resolved'
    };
    
    return statusMap[status] || status;
  }

  getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const kustomerService = new KustomerService();