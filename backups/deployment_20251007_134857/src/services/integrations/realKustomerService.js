// Real Kustomer Integration Service - Production Ready
class RealKustomerService {
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
    return this.config && this.config.status === 'connected' && this.config.apiKey && this.config.subdomain;
  }

  // Test API connection
  async testConnection() {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        user: data.data,
        message: `Connected as ${data.data.attributes.displayName || data.data.attributes.email}`
      };
    } catch (error) {
      console.error('Kustomer connection test failed:', error);
      throw error;
    }
  }

  // Customer Methods
  async findCustomer(email) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/customers?filter[email]=${encodeURIComponent(email)}&pageSize=1`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to find customer: ${response.status}`);
      }

      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
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
      const customer = {
        type: 'customer',
        attributes: {
          name: customerData.name || 'Anonymous Customer',
          emails: [
            {
              email: customerData.email,
              verified: false
            }
          ]
        }
      };

      if (customerData.phone) {
        customer.attributes.phones = [
          {
            phone: customerData.phone
          }
        ];
      }

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ data: customer })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create customer: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, updates) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const customer = {
        type: 'customer',
        id: customerId,
        attributes: updates
      };

      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ data: customer })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update customer: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Conversation Methods
  async createConversation(customerId, subject = null, channel = 'chat') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const conversation = {
        type: 'conversation',
        attributes: {
          subject: subject || 'Chat Conversation',
          channels: [channel],
          priority: this.config.defaultPriority || 1, // 1=low, 2=medium, 3=high, 4=urgent
          source: 'api',
          status: 'open'
        },
        relationships: {
          customer: {
            data: {
              type: 'customer',
              id: customerId
            }
          }
        }
      };

      // Add team assignment if configured
      if (this.config.defaultTeam) {
        conversation.relationships.assignedTeams = {
          data: [
            {
              type: 'team',
              id: this.config.defaultTeam
            }
          ]
        };
      }

      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ data: conversation })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create conversation: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId, includeMessages = false) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      let url = `${this.baseUrl}/conversations/${conversationId}`;
      if (includeMessages) {
        url += '?include=messages';
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async updateConversation(conversationId, updates) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const conversation = {
        type: 'conversation',
        id: conversationId,
        attributes: updates
      };

      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ data: conversation })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update conversation: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Message Methods
  async createMessage(conversationId, body, direction = 'in', channel = 'chat') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const message = {
        type: 'message',
        attributes: {
          body: body,
          direction: direction, // 'in' for customer, 'out' for agent
          channel: channel
        },
        relationships: {
          conversation: {
            data: {
              type: 'conversation',
              id: conversationId
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ data: message })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create message: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessages(conversationId, pageSize = 50, cursor = null) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      let url = `${this.baseUrl}/conversations/${conversationId}/messages?pageSize=${pageSize}&sort=-createdAt`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      return {
        messages: data.data || [],
        meta: data.meta || {},
        links: data.links || {}
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Note Methods
  async createNote(conversationId, body, visibility = 'private') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const note = {
        type: 'note',
        attributes: {
          body: body,
          visibility: visibility // 'private' or 'public'
        },
        relationships: {
          conversation: {
            data: {
              type: 'conversation',
              id: conversationId
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/notes`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ data: note })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create note: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Search Methods
  async searchCustomers(query, pageSize = 25) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/customers?q=${encodeURIComponent(query)}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search customers: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  async searchConversations(query, pageSize = 25) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/conversations?q=${encodeURIComponent(query)}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search conversations: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  // Team and Assignment Methods
  async getTeams() {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/teams`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async assignConversation(conversationId, teamId = null, userId = null) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      const updates = {};
      
      if (teamId) {
        updates.assignedTeams = [teamId];
      }
      
      if (userId) {
        updates.assignedUsers = [userId];
      }

      return await this.updateConversation(conversationId, updates);
    } catch (error) {
      console.error('Error assigning conversation:', error);
      throw error;
    }
  }

  // Analytics and Reporting Methods
  async getCustomerInsights(customerId) {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      // Get customer details
      const customerResponse = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!customerResponse.ok) {
        throw new Error(`Failed to fetch customer: ${customerResponse.status}`);
      }

      const customerData = await customerResponse.json();
      const customer = customerData.data;

      // Get customer's conversations
      const conversationsResponse = await fetch(
        `${this.baseUrl}/conversations?filter[customer]=${customerId}&pageSize=100`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      const conversations = conversationsResponse.ok 
        ? (await conversationsResponse.json()).data || []
        : [];

      // Calculate insights
      const totalConversations = conversations.length;
      const openConversations = conversations.filter(c => c.attributes.status === 'open').length;
      const resolvedConversations = conversations.filter(c => c.attributes.status === 'done').length;
      
      const avgResponseTime = this.calculateAverageResponseTime(conversations);
      const satisfactionScores = conversations
        .filter(c => c.attributes.satisfaction)
        .map(c => c.attributes.satisfaction.score);
      
      const avgSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
        : null;

      return {
        customer: customer,
        metrics: {
          totalConversations,
          openConversations,
          resolvedConversations,
          avgResponseTime,
          avgSatisfaction,
          satisfactionScores: satisfactionScores.length
        },
        recentConversations: conversations.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      throw error;
    }
  }

  // Chat Integration Methods
  async escalateToHuman(conversationId, reason = '', priority = 'medium') {
    if (!this.isConnected()) {
      throw new Error('Kustomer integration not configured');
    }

    try {
      // Update conversation priority and add escalation note
      const updates = {
        priority: this.mapPriorityToNumber(priority),
        status: 'open'
      };

      // Assign to default team if configured
      if (this.config.defaultTeam) {
        updates.assignedTeams = [this.config.defaultTeam];
      }

      const updatedConversation = await this.updateConversation(conversationId, updates);

      // Add escalation note
      const noteBody = `🚨 ESCALATED TO HUMAN AGENT\n\nReason: ${reason || 'Customer requested human assistance'}\n\nEscalated at: ${new Date().toISOString()}`;
      await this.createNote(conversationId, noteBody, 'private');

      return {
        success: true,
        conversationId,
        escalatedAt: new Date().toISOString(),
        reason,
        priority,
        assignedTeam: this.config.defaultTeam
      };
    } catch (error) {
      console.error('Error escalating to human:', error);
      throw error;
    }
  }

  async syncChatConversation(chatConversation, messages = []) {
    if (!this.isConnected() || !this.config.enableConversationSync) {
      return null;
    }

    try {
      let customer = null;
      
      // Find or create customer
      if (chatConversation.customer?.email) {
        customer = await this.findCustomer(chatConversation.customer.email);
        
        if (!customer) {
          customer = await this.createCustomer({
            email: chatConversation.customer.email,
            name: chatConversation.customer.name || 'Chat Customer'
          });
        }
      } else {
        throw new Error('No customer email provided');
      }

      // Create conversation in Kustomer
      const kustomerConversation = await this.createConversation(
        customer.id,
        `Chat: ${chatConversation.subject || 'Web Chat Conversation'}`,
        'chat'
      );

      // Sync messages
      const syncedMessages = [];
      for (const message of messages) {
        try {
          const direction = message.sender_type === 'user' ? 'in' : 'out';
          const syncedMessage = await this.createMessage(
            kustomerConversation.id,
            message.content,
            direction,
            'chat'
          );
          syncedMessages.push(syncedMessage);
        } catch (error) {
          console.error('Error syncing message:', error);
        }
      }

      return {
        kustomerConversationId: kustomerConversation.id,
        customerId: customer.id,
        syncedAt: new Date().toISOString(),
        messagesSynced: syncedMessages.length,
        totalMessages: messages.length
      };
    } catch (error) {
      console.error('Error syncing chat conversation:', error);
      throw error;
    }
  }

  // Utility Methods
  mapPriorityToNumber(priority) {
    const priorityMap = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'urgent': 4
    };
    return priorityMap[priority.toLowerCase()] || 2;
  }

  mapNumberToPriority(priorityNumber) {
    const priorityMap = {
      1: 'low',
      2: 'medium', 
      3: 'high',
      4: 'urgent'
    };
    return priorityMap[priorityNumber] || 'medium';
  }

  calculateAverageResponseTime(conversations) {
    // This is a simplified calculation
    // In a real implementation, you'd calculate based on message timestamps
    const responseTimes = conversations
      .filter(c => c.attributes.firstResponseAt && c.attributes.createdAt)
      .map(c => {
        const created = new Date(c.attributes.createdAt);
        const firstResponse = new Date(c.attributes.firstResponseAt);
        return Math.abs(firstResponse - created);
      });

    if (responseTimes.length === 0) return null;
    
    const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const hours = Math.floor(avgMs / (1000 * 60 * 60));
    const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  formatCustomerName(customer) {
    if (customer.attributes.name) {
      return customer.attributes.name;
    }
    
    const email = customer.attributes.emails?.[0]?.email;
    return email ? email.split('@')[0] : 'Unknown Customer';
  }

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Rate limiting and error handling
  async makeApiRequest(url, options = {}) {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers
          }
        });

        if (response.status === 429) {
          // Rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After') || '5';
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
          retries++;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        return await response.json();
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }
}

// Export singleton instance
export const realKustomerService = new RealKustomerService();
export default realKustomerService;