// Database service client for Neon - Consolidated API Version
// All operations go through /api/consolidated

const API_BASE = import.meta.env.PROD 
  ? `${window.location.origin}/api/consolidated`
  : 'http://localhost:5173/api/consolidated';

// Demo data for offline mode
const DEMO_DATA = {
  conversations: [],
  messages: [],
  botConfig: {
    id: 'demo-bot',
    organization_id: '00000000-0000-0000-0000-000000000001',
    name: 'Demo Bot',
    personality: 'friendly and helpful',
    instructions: 'You are a helpful assistant.',
    greeting_message: 'Hi! How can I help you today?',
    model: 'gpt-4',
    temperature: 0.7
  },
  integrations: []
};

class DatabaseService {
  constructor() {
    this.isOffline = false;
    this.offlineMode = false;
  }

  async call(action, data = {}) {
    if (this.offlineMode) {
      console.log(`📴 Offline mode: ${action}`);
      return this.handleOffline(action, data);
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          endpoint: 'database',
          action, 
          ...data 
        }),
      });

      if (!response.ok) {
        if (response.status === 0 || response.status >= 500) {
          console.warn('⚠️ Database appears offline, switching to demo mode');
          this.offlineMode = true;
          return this.handleOffline(action, data);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      this.offlineMode = false;
      return result.data || result;
    } catch (error) {
      console.error(`Database ${action} error:`, error);
      
      if (error.message.includes('fetch') || error.message.includes('Failed')) {
        console.warn('📴 Network error, switching to offline/demo mode');
        this.offlineMode = true;
        return this.handleOffline(action, data);
      }
      
      throw error;
    }
  }

  handleOffline(action, data) {
    console.log(`📴 OFFLINE MODE: ${action}`, data);

    switch (action) {
      case 'testConnection':
        return { connected: false, offline: true, message: 'Running in offline/demo mode' };

      case 'getBotConfigs':
        return [DEMO_DATA.botConfig];

      case 'loadBotConfig':
      case 'saveBotConfig':
      case 'updateBotConfig':
        console.log('📝 Demo mode: Bot config saved (local only)');
        DEMO_DATA.botConfig = { ...DEMO_DATA.botConfig, ...data };
        return DEMO_DATA.botConfig;

      case 'getProactiveTriggers':
        return [];

      case 'saveProactiveTrigger':
      case 'updateProactiveTrigger':
      case 'toggleProactiveTrigger':
        console.log('📝 Demo mode: Trigger saved (local only)');
        return data;

      case 'deleteProactiveTrigger':
        console.log('📝 Demo mode: Trigger deleted (local only)');
        return { success: true };

      case 'getProactiveTriggerStats':
        return [];

      case 'getIntegrations':
        return DEMO_DATA.integrations;

      case 'upsertIntegration':
        const existingIdx = DEMO_DATA.integrations.findIndex(
          i => i.integration_id === data.integration_id
        );
        if (existingIdx >= 0) {
          DEMO_DATA.integrations[existingIdx] = { ...DEMO_DATA.integrations[existingIdx], ...data };
        } else {
          DEMO_DATA.integrations.push(data);
        }
        return data;

      case 'createAnalyticsEvent':
        console.log('📊 Demo mode: Analytics event logged (local only)');
        return { success: true };

      case 'getAnalytics':
        return { events: [], totalEvents: 0, message: 'Demo mode - no analytics data' };

      default:
        console.warn(`⚠️ Unhandled offline action: ${action}`);
        return null;
    }
  }

  setOfflineMode(offline) {
    this.offlineMode = offline;
    console.log(offline ? '📴 Offline mode enabled' : '🌐 Online mode enabled');
  }

  isInOfflineMode() {
    return this.offlineMode;
  }

  async testConnection() {
    return this.call('testConnection');
  }

  async getBotConfigs(orgId) {
    return this.call('getBotConfigs', { orgId });
  }

  async saveBotConfig(botConfigData) {
    return this.call('saveBotConfig', botConfigData);
  }

  async updateBotConfig(botConfig) {
    return this.call('updateBotConfig', botConfig);
  }

  async getConversations(orgId, limit = 50) {
    try {
      const response = await fetch(`${API_BASE}?type=conversations&limit=${limit}`);
      const result = await response.json();
      console.log('💬 Loaded conversations:', result.conversations?.length);
      return result.conversations || [];
    } catch (error) {
      console.error('Database getConversations error:', error);
      return this.handleOffline('getConversations', { orgId, limit });
    }
  }

  async createConversation(conversationData) {
    return this.call('create_conversation', conversationData);
  }

  async getMessages(conversationId) {
    try {
      const response = await fetch(`${API_BASE}?type=messages&conversation_id=${conversationId}`);
      const result = await response.json();
      console.log('📨 Loaded messages:', result.messages?.length);
      return result.messages || [];
    } catch (error) {
      console.error('Database getMessages error:', error);
      return this.handleOffline('getMessages', { conversationId });
    }
  }

  async createMessage(messageData) {
    return this.call('create_message', messageData);
  }

  async getIntegrations(orgId) {
    return this.call('getIntegrations', { orgId });
  }

  async upsertIntegration(integrationData) {
    return this.call('upsertIntegration', integrationData);
  }

  async createAnalyticsEvent(eventData) {
    return this.call('createAnalyticsEvent', eventData);
  }

  async getAnalytics(orgId, startDate, endDate) {
    return this.call('getAnalytics', { orgId, startDate, endDate });
  }

  async upsertCustomer(customerData) {
    return this.call('upsertCustomer', customerData);
  }

  // Proactive Triggers
  async getProactiveTriggers(orgId) {
    return this.call('getProactiveTriggers', { orgId });
  }

  async saveProactiveTrigger(triggerData) {
    return this.call('saveProactiveTrigger', triggerData);
  }

  async updateProactiveTrigger(triggerId, updates) {
    return this.call('updateProactiveTrigger', { triggerId, updates });
  }

  async deleteProactiveTrigger(triggerId) {
    return this.call('deleteProactiveTrigger', { triggerId });
  }

  async toggleProactiveTrigger(triggerId, enabled) {
    return this.call('toggleProactiveTrigger', { triggerId, enabled });
  }

  async logProactiveTriggerEvent(eventData) {
    return this.call('logProactiveTriggerEvent', eventData);
  }

  async getProactiveTriggerStats(orgId, startDate, endDate) {
    return this.call('getProactiveTriggerStats', { orgId, startDate, endDate });
  }
}

export const dbService = new DatabaseService();
export default dbService;
