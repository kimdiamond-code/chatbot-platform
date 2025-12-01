// ===================================================================
// CENTRALIZED KLAVIYO SERVICE
// Uses admin credentials + user's company ID
// ===================================================================

import integrationService from './integrationService.js';

class CentralizedKlaviyoService {

  // ==================== CONNECTION ====================

  async testConnection() {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        '/accounts/',
        { method: 'GET' },
        null // Klaviyo doesn't need user identifier for account info
      );
      return {
        success: true,
        account: result.data,
        message: 'Successfully connected to Klaviyo'
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // ==================== LISTS ====================

  async getLists() {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        '/lists/',
        { method: 'GET' },
        null
      );
      return result.data || [];
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw error;
    }
  }

  async getList(listId) {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        `/lists/${listId}`,
        { method: 'GET' },
        null
      );
      return result.data;
    } catch (error) {
      console.error('Error fetching list:', error);
      throw error;
    }
  }

  // ==================== PROFILES ====================

  async createProfile(profileData) {
    try {
      const payload = {
        data: {
          type: 'profile',
          attributes: {
            email: profileData.email,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone_number: profileData.phone,
            properties: profileData.properties || {}
          }
        }
      };

      const result = await integrationService.makeRequest(
        'klaviyo',
        '/profiles/',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );
      return result.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async getProfileByEmail(email) {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        `/profiles/?filter=equals(email,"${email}")`,
        { method: 'GET' },
        null
      );
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileId, updates) {
    try {
      const payload = {
        data: {
          type: 'profile',
          id: profileId,
          attributes: updates
        }
      };

      const result = await integrationService.makeRequest(
        'klaviyo',
        `/profiles/${profileId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload)
        },
        null
      );
      return result.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  async subscribeToList(listId, profileData) {
    try {
      // First, create or get the profile
      let profile = await this.getProfileByEmail(profileData.email);
      
      if (!profile) {
        profile = await this.createProfile(profileData);
      }

      // Then add to list
      const payload = {
        data: [
          {
            type: 'profile',
            id: profile.id
          }
        ]
      };

      const result = await integrationService.makeRequest(
        'klaviyo',
        `/lists/${listId}/relationships/profiles/`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );
      
      return {
        success: true,
        profile: profile,
        message: `Successfully subscribed ${profileData.email} to list`
      };
    } catch (error) {
      console.error('Error subscribing to list:', error);
      throw error;
    }
  }

  async unsubscribeFromList(listId, profileId) {
    try {
      const payload = {
        data: [
          {
            type: 'profile',
            id: profileId
          }
        ]
      };

      await integrationService.makeRequest(
        'klaviyo',
        `/lists/${listId}/relationships/profiles/`,
        {
          method: 'DELETE',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        message: 'Successfully unsubscribed from list'
      };
    } catch (error) {
      console.error('Error unsubscribing from list:', error);
      throw error;
    }
  }

  // ==================== EVENTS ====================

  async trackEvent(eventName, profileData, properties = {}) {
    try {
      const payload = {
        data: {
          type: 'event',
          attributes: {
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
                  email: profileData.email,
                  first_name: profileData.firstName,
                  last_name: profileData.lastName,
                  phone_number: profileData.phone
                }
              }
            },
            properties: properties,
            time: new Date().toISOString()
          }
        }
      };

      const result = await integrationService.makeRequest(
        'klaviyo',
        '/events/',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        null
      );

      return {
        success: true,
        event: result.data,
        message: `Event "${eventName}" tracked successfully`
      };
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  // ==================== CAMPAIGNS ====================

  async getCampaigns() {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        '/campaigns/',
        { method: 'GET' },
        null
      );
      return result.data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // ==================== FLOWS ====================

  async getFlows() {
    try {
      const result = await integrationService.makeRequest(
        'klaviyo',
        '/flows/',
        { method: 'GET' },
        null
      );
      return result.data || [];
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  }
}

const centralizedKlaviyoService = new CentralizedKlaviyoService();
export default centralizedKlaviyoService;
