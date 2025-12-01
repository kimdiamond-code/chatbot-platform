// ===================================================================
// CENTRALIZED MESSENGER SERVICE
// Uses admin credentials + user's page ID
// ===================================================================

import integrationService from './integrationService.js';

class CentralizedMessengerService {

  // ==================== CONNECTION ====================

  async testConnection(pageId) {
    try {
      const result = await integrationService.makeRequest(
        'messenger',
        `/${pageId}?fields=name,id`,
        { method: 'GET' },
        null
      );
      return {
        success: true,
        page: result,
        message: `Connected to ${result.name}`
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // ==================== SEND MESSAGES ====================

  async sendTextMessage(recipientId, text) {
    try {
      const payload = {
        recipient: { id: recipientId },
        message: { text: text }
      };

      const result = await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        messageId: result.message_id,
        recipientId: result.recipient_id
      };
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  async sendButtonMessage(recipientId, text, buttons) {
    try {
      const payload = {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: text,
              buttons: buttons
            }
          }
        }
      };

      const result = await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        messageId: result.message_id
      };
    } catch (error) {
      console.error('Error sending button message:', error);
      throw error;
    }
  }

  async sendQuickReplies(recipientId, text, quickReplies) {
    try {
      const payload = {
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

      const result = await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        messageId: result.message_id
      };
    } catch (error) {
      console.error('Error sending quick replies:', error);
      throw error;
    }
  }

  async sendGenericTemplate(recipientId, elements) {
    try {
      const payload = {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        }
      };

      const result = await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        messageId: result.message_id
      };
    } catch (error) {
      console.error('Error sending generic template:', error);
      throw error;
    }
  }

  async sendImage(recipientId, imageUrl) {
    try {
      const payload = {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }
      };

      const result = await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        messageId: result.message_id
      };
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  }

  // ==================== SENDER ACTIONS ====================

  async markSeen(recipientId) {
    try {
      const payload = {
        recipient: { id: recipientId },
        sender_action: 'mark_seen'
      };

      await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking as seen:', error);
      throw error;
    }
  }

  async typingOn(recipientId) {
    try {
      const payload = {
        recipient: { id: recipientId },
        sender_action: 'typing_on'
      };

      await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return { success: true };
    } catch (error) {
      console.error('Error turning typing on:', error);
      throw error;
    }
  }

  async typingOff(recipientId) {
    try {
      const payload = {
        recipient: { id: recipientId },
        sender_action: 'typing_off'
      };

      await integrationService.makeRequest(
        'messenger',
        '/me/messages',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return { success: true };
    } catch (error) {
      console.error('Error turning typing off:', error);
      throw error;
    }
  }

  // ==================== USER PROFILE ====================

  async getUserProfile(userId) {
    try {
      const result = await integrationService.makeRequest(
        'messenger',
        `/${userId}?fields=first_name,last_name,profile_pic`,
        { method: 'GET' },
        null
      );

      return result;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  createPostbackButton(title, payload) {
    return {
      type: 'postback',
      title: title,
      payload: payload
    };
  }

  createUrlButton(title, url) {
    return {
      type: 'web_url',
      title: title,
      url: url
    };
  }

  createGenericElement(title, imageUrl, subtitle, buttons) {
    return {
      title: title,
      image_url: imageUrl,
      subtitle: subtitle,
      buttons: buttons
    };
  }

  // ==================== PRODUCT RECOMMENDATIONS ====================

  async sendProductRecommendation(recipientId, product) {
    const element = this.createGenericElement(
      product.title,
      product.image,
      product.description,
      [
        this.createUrlButton('View Product', product.url),
        this.createPostbackButton('Add to Cart', `ADD_TO_CART_${product.id}`)
      ]
    );

    return await this.sendGenericTemplate(recipientId, [element]);
  }

  async sendProductCarousel(recipientId, products) {
    const elements = products.map(product => 
      this.createGenericElement(
        product.title,
        product.image,
        `${product.price}`,
        [
          this.createUrlButton('View', product.url),
          this.createPostbackButton('Add to Cart', `ADD_TO_CART_${product.id}`)
        ]
      )
    );

    return await this.sendGenericTemplate(recipientId, elements);
  }
}

const centralizedMessengerService = new CentralizedMessengerService();
export default centralizedMessengerService;
