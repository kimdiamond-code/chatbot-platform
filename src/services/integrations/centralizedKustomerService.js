// ===================================================================
// CENTRALIZED KUSTOMER SERVICE
// Uses admin credentials + user's subdomain
// ===================================================================

import integrationService from './integrationService.js';

class CentralizedKustomerService {

  // ==================== CONNECTION ====================

  async testConnection(subdomain) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        '/auth/verify',
        { method: 'GET' },
        subdomain
      );
      return {
        success: true,
        user: result.data,
        message: 'Successfully connected to Kustomer'
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // ==================== CUSTOMERS ====================

  async getCustomerByEmail(subdomain, email) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/customers?email=${encodeURIComponent(email)}`,
        { method: 'GET' },
        subdomain
      );
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async createCustomer(subdomain, customerData) {
    try {
      const payload = {
        name: customerData.name,
        emails: customerData.email ? [{ email: customerData.email, type: 'home' }] : [],
        phones: customerData.phone ? [{ phone: customerData.phone, type: 'mobile' }] : [],
        custom: customerData.custom || {}
      };

      const result = await integrationService.makeRequest(
        'kustomer',
        '/customers',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(subdomain, customerId, updates) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/customers/${customerId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(subdomain, customerId, limit = 10) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations?customer=${customerId}&page[size]=${limit}`,
        { method: 'GET' },
        subdomain
      );
      return result.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getConversation(subdomain, conversationId) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}`,
        { method: 'GET' },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async createConversation(subdomain, conversationData) {
    try {
      const payload = {
        customer: conversationData.customerId,
        title: conversationData.title || 'Chat Conversation',
        channels: conversationData.channels || ['chat'],
        priority: conversationData.priority || 1,
        status: conversationData.status || 'open'
      };

      const result = await integrationService.makeRequest(
        'kustomer',
        '/conversations',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async updateConversation(subdomain, conversationId, updates) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // ==================== MESSAGES ====================

  async getMessages(subdomain, conversationId) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}/messages`,
        { method: 'GET' },
        subdomain
      );
      return result.data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(subdomain, conversationId, messageData) {
    try {
      const payload = {
        direction: 'out',
        body: messageData.body,
        channel: messageData.channel || 'chat',
        meta: messageData.meta || {}
      };

      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // ==================== NOTES ====================

  async addNote(subdomain, conversationId, noteText) {
    try {
      const payload = {
        body: noteText,
        direction: 'out',
        channel: 'note'
      };

      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // ==================== TAGS ====================

  async addTag(subdomain, conversationId, tag) {
    try {
      const result = await integrationService.makeRequest(
        'kustomer',
        `/conversations/${conversationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            tags: { $push: [tag] }
          })
        },
        subdomain
      );
      return result.data;
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  // ==================== HELPERS ====================

  async findOrCreateCustomer(subdomain, customerData) {
    try {
      // Try to find existing customer by email
      let customer = null;
      
      if (customerData.email) {
        customer = await this.getCustomerByEmail(subdomain, customerData.email);
      }

      // If not found, create new customer
      if (!customer) {
        customer = await this.createCustomer(subdomain, customerData);
      }

      return customer;
    } catch (error) {
      console.error('Error finding or creating customer:', error);
      throw error;
    }
  }

  async createTicket(subdomain, ticketData) {
    try {
      // Find or create customer
      const customer = await this.findOrCreateCustomer(subdomain, {
        name: ticketData.customerName,
        email: ticketData.customerEmail,
        phone: ticketData.customerPhone
      });

      // Create conversation
      const conversation = await this.createConversation(subdomain, {
        customerId: customer.id,
        title: ticketData.subject || 'Support Request',
        priority: ticketData.priority || 1
      });

      // Send initial message if provided
      if (ticketData.message) {
        await this.sendMessage(subdomain, conversation.id, {
          body: ticketData.message,
          channel: 'chat'
        });
      }

      return {
        success: true,
        customer: customer,
        conversation: conversation,
        message: 'Ticket created successfully'
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }
}

const centralizedKustomerService = new CentralizedKustomerService();
export default centralizedKustomerService;
