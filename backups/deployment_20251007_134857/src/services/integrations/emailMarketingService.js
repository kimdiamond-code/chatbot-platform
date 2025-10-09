// Email Marketing Integration Service - Klaviyo & Mailchimp
class EmailMarketingService {
  constructor() {
    this.klaviyoConfig = this.loadConfig('klaviyo');
    this.mailchimpConfig = this.loadConfig('mailchimp');
    this.initializeConfigs();
  }

  loadConfig(platform) {
    const saved = localStorage.getItem(`${platform}_config`);
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfigs() {
    // Initialize Klaviyo
    if (this.klaviyoConfig && this.klaviyoConfig.status === 'connected') {
      this.klaviyoHeaders = {
        'Authorization': `Klaviyo-API-Key ${this.klaviyoConfig.apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      };
    }

    // Initialize Mailchimp
    if (this.mailchimpConfig && this.mailchimpConfig.status === 'connected') {
      this.mailchimpHeaders = {
        'Authorization': `Bearer ${this.mailchimpConfig.apiKey}`,
        'Content-Type': 'application/json'
      };
      this.mailchimpBaseUrl = `https://${this.mailchimpConfig.server}.api.mailchimp.com/3.0`;
    }
  }

  isKlaviyoConnected() {
    return this.klaviyoConfig && this.klaviyoConfig.status === 'connected' && this.klaviyoConfig.apiKey;
  }

  isMailchimpConnected() {
    return this.mailchimpConfig && this.mailchimpConfig.status === 'connected' && this.mailchimpConfig.apiKey && this.mailchimpConfig.server;
  }

  // ========== KLAVIYO METHODS ==========

  async testKlaviyoConnection() {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const response = await fetch('https://a.klaviyo.com/api/accounts/', {
        method: 'GET',
        headers: this.klaviyoHeaders
      });

      if (!response.ok) {
        throw new Error(`Klaviyo connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const account = data.data && data.data.length > 0 ? data.data[0] : null;
      
      return {
        success: true,
        account: account,
        message: `Connected to Klaviyo account: ${account?.attributes?.contact_information?.organization_name || 'Account'}`
      };
    } catch (error) {
      console.error('Klaviyo connection test failed:', error);
      throw error;
    }
  }

  async klaviyoCreateProfile(email, properties = {}) {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const profile = {
        data: {
          type: 'profile',
          attributes: {
            email: email,
            ...properties
          }
        }
      };

      const response = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers: this.klaviyoHeaders,
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create Klaviyo profile: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating Klaviyo profile:', error);
      throw error;
    }
  }

  async klaviyoFindProfile(email) {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const response = await fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,"${email}")`, {
        method: 'GET',
        headers: this.klaviyoHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to find Klaviyo profile: ${response.status}`);
      }

      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error('Error finding Klaviyo profile:', error);
      throw error;
    }
  }

  async klaviyoGetLists() {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const response = await fetch('https://a.klaviyo.com/api/lists/', {
        method: 'GET',
        headers: this.klaviyoHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Klaviyo lists: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Klaviyo lists:', error);
      throw error;
    }
  }

  async klaviyoSubscribeToList(listId, email, properties = {}) {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const subscription = {
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: 'SUBSCRIBED'
                        }
                      }
                    },
                    ...properties
                  }
                }
              ]
            }
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: listId
              }
            }
          }
        }
      };

      const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
        method: 'POST',
        headers: this.klaviyoHeaders,
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to subscribe to Klaviyo list: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error subscribing to Klaviyo list:', error);
      throw error;
    }
  }

  async klaviyoTrackEvent(email, eventName, properties = {}) {
    if (!this.isKlaviyoConnected()) {
      throw new Error('Klaviyo integration not configured');
    }

    try {
      const event = {
        data: {
          type: 'event',
          attributes: {
            properties: {
              ...properties
            },
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: eventName
                }
              }
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: email
                }
              }
            }
          }
        }
      };

      const response = await fetch('https://a.klaviyo.com/api/events/', {
        method: 'POST',
        headers: this.klaviyoHeaders,
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to track Klaviyo event: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error tracking Klaviyo event:', error);
      throw error;
    }
  }

  // ========== MAILCHIMP METHODS ==========

  async testMailchimpConnection() {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const response = await fetch(`${this.mailchimpBaseUrl}/`, {
        method: 'GET',
        headers: this.mailchimpHeaders
      });

      if (!response.ok) {
        throw new Error(`Mailchimp connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        account: data,
        message: `Connected to Mailchimp account: ${data.account_name || 'Account'}`
      };
    } catch (error) {
      console.error('Mailchimp connection test failed:', error);
      throw error;
    }
  }

  async mailchimpGetLists() {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const response = await fetch(`${this.mailchimpBaseUrl}/lists`, {
        method: 'GET',
        headers: this.mailchimpHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Mailchimp lists: ${response.status}`);
      }

      const data = await response.json();
      return data.lists || [];
    } catch (error) {
      console.error('Error fetching Mailchimp lists:', error);
      throw error;
    }
  }

  async mailchimpFindMember(listId, email) {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const subscriberHash = await this.generateSubscriberHash(email);
      const response = await fetch(`${this.mailchimpBaseUrl}/lists/${listId}/members/${subscriberHash}`, {
        method: 'GET',
        headers: this.mailchimpHeaders
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to find Mailchimp member: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error finding Mailchimp member:', error);
      throw error;
    }
  }

  async mailchimpSubscribeMember(listId, email, mergeFields = {}, interests = {}) {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const member = {
        email_address: email,
        status: 'subscribed',
        merge_fields: mergeFields,
        interests: interests
      };

      const response = await fetch(`${this.mailchimpBaseUrl}/lists/${listId}/members`, {
        method: 'POST',
        headers: this.mailchimpHeaders,
        body: JSON.stringify(member)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If member already exists, try to update instead
        if (response.status === 400 && errorData.title === 'Member Exists') {
          return await this.mailchimpUpdateMember(listId, email, mergeFields, interests, 'subscribed');
        }
        throw new Error(`Failed to subscribe Mailchimp member: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error subscribing Mailchimp member:', error);
      throw error;
    }
  }

  async mailchimpUpdateMember(listId, email, mergeFields = {}, interests = {}, status = 'subscribed') {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const subscriberHash = await this.generateSubscriberHash(email);
      const member = {
        email_address: email,
        status: status,
        merge_fields: mergeFields,
        interests: interests
      };

      const response = await fetch(`${this.mailchimpBaseUrl}/lists/${listId}/members/${subscriberHash}`, {
        method: 'PUT',
        headers: this.mailchimpHeaders,
        body: JSON.stringify(member)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update Mailchimp member: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating Mailchimp member:', error);
      throw error;
    }
  }

  async mailchimpAddTags(listId, email, tags) {
    if (!this.isMailchimpConnected()) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const subscriberHash = await this.generateSubscriberHash(email);
      const tagsData = {
        tags: tags.map(tag => ({
          name: tag,
          status: 'active'
        }))
      };

      const response = await fetch(`${this.mailchimpBaseUrl}/lists/${listId}/members/${subscriberHash}/tags`, {
        method: 'POST',
        headers: this.mailchimpHeaders,
        body: JSON.stringify(tagsData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to add Mailchimp tags: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return true;
    } catch (error) {
      console.error('Error adding Mailchimp tags:', error);
      throw error;
    }
  }

  // ========== UNIFIED METHODS ==========

  async subscribeToNewsletter(email, name = '', platform = 'auto', listId = null) {
    const results = {
      klaviyo: null,
      mailchimp: null,
      success: false
    };

    // Auto-detect or use specified platform
    if (platform === 'auto' || platform === 'klaviyo') {
      if (this.isKlaviyoConnected()) {
        try {
          // Get default list or use provided listId
          const lists = await this.klaviyoGetLists();
          const targetListId = listId || (lists.length > 0 ? lists[0].id : null);
          
          if (targetListId) {
            const result = await this.klaviyoSubscribeToList(targetListId, email, {
              first_name: name.split(' ')[0] || '',
              last_name: name.split(' ').slice(1).join(' ') || ''
            });
            results.klaviyo = { success: true, data: result };
            results.success = true;
          }
        } catch (error) {
          results.klaviyo = { success: false, error: error.message };
        }
      }
    }

    if (platform === 'auto' || platform === 'mailchimp') {
      if (this.isMailchimpConnected()) {
        try {
          // Get default list or use provided listId
          const lists = await this.mailchimpGetLists();
          const targetListId = listId || (lists.length > 0 ? lists[0].id : null);
          
          if (targetListId) {
            const mergeFields = {
              FNAME: name.split(' ')[0] || '',
              LNAME: name.split(' ').slice(1).join(' ') || ''
            };
            
            const result = await this.mailchimpSubscribeMember(targetListId, email, mergeFields);
            results.mailchimp = { success: true, data: result };
            results.success = true;
          }
        } catch (error) {
          results.mailchimp = { success: false, error: error.message };
        }
      }
    }

    return results;
  }

  async trackChatEvent(email, eventName = 'Chat Interaction', properties = {}) {
    const results = {
      klaviyo: null,
      success: false
    };

    if (this.isKlaviyoConnected()) {
      try {
        const result = await this.klaviyoTrackEvent(email, eventName, {
          source: 'chatbot',
          timestamp: new Date().toISOString(),
          ...properties
        });
        results.klaviyo = { success: true, data: result };
        results.success = true;
      } catch (error) {
        results.klaviyo = { success: false, error: error.message };
      }
    }

    return results;
  }

  async handleEmailMarketingInquiry(message, customerEmail) {
    const inquiry = message.toLowerCase();
    
    // Newsletter subscription
    if (inquiry.includes('newsletter') || inquiry.includes('subscribe') || inquiry.includes('email updates')) {
      try {
        const result = await this.subscribeToNewsletter(customerEmail);
        
        if (result.success) {
          return {
            type: 'newsletter_subscription',
            data: result,
            response: 'Great! I\'ve subscribed you to our newsletter. You\'ll receive updates about our latest products and offers.'
          };
        } else {
          return {
            type: 'subscription_error',
            response: 'I\'m having trouble subscribing you right now. Please try again later or contact support.'
          };
        }
      } catch (error) {
        console.error('Error handling newsletter subscription:', error);
        return {
          type: 'subscription_error',
          response: 'I\'m unable to process your subscription right now. Please try again later.'
        };
      }
    }

    // Unsubscribe requests
    if (inquiry.includes('unsubscribe') || inquiry.includes('stop emails') || inquiry.includes('remove email')) {
      return {
        type: 'unsubscribe_request',
        response: 'I understand you\'d like to unsubscribe. You can click the unsubscribe link in any of our emails, or I can help you connect with support to handle this request.'
      };
    }

    return null;
  }

  // Utility Methods
  async generateSubscriberHash(email) {
    // Generate MD5 hash for Mailchimp subscriber hash
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase());
    const hashBuffer = await crypto.subtle.digest('MD5', data).catch(async () => {
      // Fallback if MD5 is not available
      return await crypto.subtle.digest('SHA-256', data);
    });
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getAvailablePlatforms() {
    return {
      klaviyo: this.isKlaviyoConnected(),
      mailchimp: this.isMailchimpConnected()
    };
  }

  formatPlatformStatus() {
    const platforms = this.getAvailablePlatforms();
    const connected = Object.keys(platforms).filter(key => platforms[key]);
    const disconnected = Object.keys(platforms).filter(key => !platforms[key]);
    
    return {
      connected,
      disconnected,
      hasAnyConnection: connected.length > 0
    };
  }
}

// Export singleton instance
export const emailMarketingService = new EmailMarketingService();
export default emailMarketingService;