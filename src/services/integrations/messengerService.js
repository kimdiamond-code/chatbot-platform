// Facebook Messenger Integration Service
class MessengerService {
  constructor() {
    this.config = this.loadConfig();
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.initializeConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('messenger_config');
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfig() {
    if (this.config && this.config.status === 'connected') {
      this.pageAccessToken = this.config.pageAccessToken;
      this.pageId = this.config.pageId;
      this.verifyToken = this.config.verifyToken;
    }
  }

  isConnected() {
    return this.config && this.config.status === 'connected' && this.pageAccessToken;
  }

  // ==================== MESSAGING ====================

  async sendTextMessage(recipientId, messageText) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const messageData = {
        recipient: { id: recipientId },
        message: { text: messageText }
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...messageData,
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send message: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.message_id,
        recipientId: data.recipient_id
      };
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  async sendQuickReplies(recipientId, text, quickReplies) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const messageData = {
        recipient: { id: recipientId },
        message: {
          text: text,
          quick_replies: quickReplies.map(reply => ({
            content_type: 'text',
            title: reply.title,
            payload: reply.payload || reply.title
          }))
        }
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...messageData,
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send quick replies: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.message_id
      };
    } catch (error) {
      console.error('Error sending quick replies:', error);
      throw error;
    }
  }

  async sendButtonTemplate(recipientId, text, buttons) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const messageData = {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: text,
              buttons: buttons.map(button => ({
                type: button.type || 'postback',
                title: button.title,
                payload: button.payload || button.title,
                url: button.url
              }))
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...messageData,
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send button template: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.message_id
      };
    } catch (error) {
      console.error('Error sending button template:', error);
      throw error;
    }
  }

  async sendGenericTemplate(recipientId, elements) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const messageData = {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements.map(element => ({
                title: element.title,
                subtitle: element.subtitle,
                image_url: element.imageUrl,
                buttons: element.buttons?.map(button => ({
                  type: button.type || 'postback',
                  title: button.title,
                  payload: button.payload || button.title,
                  url: button.url
                }))
              }))
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...messageData,
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send generic template: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.message_id
      };
    } catch (error) {
      console.error('Error sending generic template:', error);
      throw error;
    }
  }

  async sendTypingIndicator(recipientId, typing = true) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: typing ? 'typing_on' : 'typing_off',
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send typing indicator: ${errorData.error?.message || response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      throw error;
    }
  }

  // ==================== USER PROFILE ====================

  async getUserProfile(userId) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${userId}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${this.pageAccessToken}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get user profile: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        profilePic: data.profile_pic,
        locale: data.locale,
        timezone: data.timezone,
        gender: data.gender
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // ==================== WEBHOOK HANDLING ====================

  handleWebhookEvent(event) {
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const timestamp = event.timestamp;
    
    // Handle message
    if (event.message) {
      return this.handleMessage(senderId, event.message, timestamp);
    }
    
    // Handle postback
    if (event.postback) {
      return this.handlePostback(senderId, event.postback, timestamp);
    }
    
    // Handle quick reply
    if (event.message?.quick_reply) {
      return this.handleQuickReply(senderId, event.message.quick_reply, timestamp);
    }
    
    return null;
  }

  handleMessage(senderId, message, timestamp) {
    return {
      type: 'message',
      senderId: senderId,
      text: message.text,
      attachments: message.attachments,
      timestamp: timestamp,
      messageId: message.mid
    };
  }

  handlePostback(senderId, postback, timestamp) {
    return {
      type: 'postback',
      senderId: senderId,
      payload: postback.payload,
      title: postback.title,
      timestamp: timestamp
    };
  }

  handleQuickReply(senderId, quickReply, timestamp) {
    return {
      type: 'quick_reply',
      senderId: senderId,
      payload: quickReply.payload,
      timestamp: timestamp
    };
  }

  // ==================== PAGE SETTINGS ====================

  async setGetStartedButton(payload = 'GET_STARTED') {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/messenger_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          get_started: { payload: payload },
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set get started button: ${errorData.error?.message || response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting get started button:', error);
      throw error;
    }
  }

  async setGreeting(greetingText) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/messenger_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          greeting: [
            {
              locale: 'default',
              text: greetingText
            }
          ],
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set greeting: ${errorData.error?.message || response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting greeting:', error);
      throw error;
    }
  }

  async setPersistentMenu(menuItems) {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/messenger_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          persistent_menu: [
            {
              locale: 'default',
              composer_input_disabled: false,
              call_to_actions: menuItems.map(item => ({
                type: item.type || 'postback',
                title: item.title,
                payload: item.payload,
                url: item.url
              }))
            }
          ],
          access_token: this.pageAccessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set persistent menu: ${errorData.error?.message || response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting persistent menu:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async testConnection() {
    if (!this.isConnected()) {
      throw new Error('Messenger integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me?access_token=${this.pageAccessToken}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Connection test failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        pageName: data.name,
        pageId: data.id,
        message: `Connected to Facebook Page: ${data.name}`
      };
    } catch (error) {
      console.error('Messenger connection test failed:', error);
      throw error;
    }
  }

  formatUserName(profile) {
    if (!profile) return 'User';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
  }

  getWebhookUrl() {
    return `${window.location.origin}/api/consolidated?action=messenger_webhook`;
  }

  generateVerifyToken() {
    return `verify_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Export singleton instance
export const messengerService = new MessengerService();
export default messengerService;
