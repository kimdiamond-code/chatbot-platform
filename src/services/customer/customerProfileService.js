// Customer Profile Service - Persistent user memory and personalization
import { dbService } from '../databaseService';
import { privacyService } from '../privacyService';

class CustomerProfileService {
  constructor() {
    this.sessionCache = new Map(); // In-memory cache for active sessions
  }

  /**
   * Get or create customer profile
   * Called when customer starts a conversation
   */
  async getOrCreateProfile(email, organizationId, additionalData = {}) {
    if (!email || !organizationId) {
      console.warn('⚠️ Missing email or organizationId for customer profile');
      return null;
    }

    try {
      console.log('👤 Getting/creating customer profile:', email);

      // Log data access for compliance
      await privacyService.logDataAccess(
        email,
        'read',
        'customer_profile',
        'Load customer for chat session',
        'system'
      );

      // Check cache first
      const cacheKey = `${organizationId}:${email}`;
      if (this.sessionCache.has(cacheKey)) {
        const cached = this.sessionCache.get(cacheKey);
        console.log('💨 Using cached profile');
        return cached;
      }

      // Try to get existing customer from database
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getCustomer',
          organizationId,
          email
        })
      });

      const result = await response.json();

      if (result.success && result.customer) {
        // Existing customer - update visit count and last seen
        console.log('✅ Existing customer found');
        const profile = await this.updateVisit(result.customer, additionalData);
        this.sessionCache.set(cacheKey, profile);
        return profile;
      } else {
        // New customer - create profile
        console.log('🆕 Creating new customer profile');
        const profile = await this.createProfile(email, organizationId, additionalData);
        this.sessionCache.set(cacheKey, profile);
        return profile;
      }
    } catch (error) {
      console.error('❌ Error getting/creating customer profile:', error);
      return null;
    }
  }

  /**
   * Create new customer profile
   */
  async createProfile(email, organizationId, data = {}) {
    try {
      // Anonymize email in logs for privacy
      console.log('🆕 Creating customer profile:', privacyService.anonymizePII(email));
      
      const customerData = {
        organization_id: organizationId,
        email: email,
        name: data.name || null,
        phone: data.phone || null,
        metadata: {
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          visitCount: 1,
          totalMessages: 0,
          preferences: {},
          behavior: {
            preferredChannel: data.channel || 'web',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          history: {
            conversations: [],
            orders: [],
            topics: []
          }
        },
        tags: ['new-customer']
      };

      const result = await dbService.upsertCustomer(customerData);
      
      // Log creation for audit trail
      await privacyService.logDataAccess(
        email,
        'create',
        'customer_profile',
        'New customer profile created',
        'system'
      );
      
      console.log('✅ Customer profile created:', privacyService.anonymizePII(email));
      return result;
    } catch (error) {
      console.error('❌ Error creating customer profile:', error);
      return null;
    }
  }

  /**
   * Update customer visit
   */
  async updateVisit(customer, additionalData = {}) {
    try {
      const metadata = customer.metadata || {};
      const visitCount = (metadata.visitCount || 0) + 1;

      const updatedMetadata = {
        ...metadata,
        lastSeen: new Date().toISOString(),
        visitCount: visitCount,
        behavior: {
          ...(metadata.behavior || {}),
          lastChannel: additionalData.channel || 'web'
        }
      };

      // Update tags based on visit frequency
      let tags = customer.tags || [];
      if (visitCount > 10 && !tags.includes('frequent-visitor')) {
        tags.push('frequent-visitor');
      }
      if (visitCount === 1) {
        tags = tags.filter(t => t !== 'new-customer');
      }

      const updatedCustomer = await dbService.upsertCustomer({
        organization_id: customer.organization_id,
        email: customer.email,
        name: customer.name || additionalData.name,
        phone: customer.phone || additionalData.phone,
        metadata: updatedMetadata,
        tags: tags
      });

      console.log(`✅ Customer visit updated: ${customer.email} (Visit #${visitCount})`);
      return updatedCustomer;
    } catch (error) {
      console.error('❌ Error updating customer visit:', error);
      return customer; // Return original if update fails
    }
  }

  /**
   * Record conversation topic
   */
  async recordConversationTopic(email, organizationId, topic, conversationId) {
    try {
      const profile = await this.getOrCreateProfile(email, organizationId);
      if (!profile) return;

      const metadata = profile.metadata || {};
      const history = metadata.history || {};
      const topics = history.topics || [];

      // Add topic with timestamp
      topics.push({
        topic,
        conversationId,
        timestamp: new Date().toISOString()
      });

      // Keep last 20 topics
      const recentTopics = topics.slice(-20);

      await dbService.upsertCustomer({
        organization_id: organizationId,
        email: email,
        name: profile.name,
        phone: profile.phone,
        metadata: {
          ...metadata,
          history: {
            ...history,
            topics: recentTopics
          }
        },
        tags: profile.tags
      });

      console.log(`📝 Recorded topic "${topic}" for ${email}`);
    } catch (error) {
      console.error('❌ Error recording conversation topic:', error);
    }
  }

  /**
   * Get customer conversation history
   */
  async getConversationHistory(email, organizationId, limit = 10) {
    try {
      const profile = await this.getOrCreateProfile(email, organizationId);
      if (!profile) return [];

      // Get recent conversations from database
      const conversations = await dbService.call('getCustomerConversations', {
        organizationId,
        customerEmail: email,
        limit
      });

      return conversations || [];
    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Get personalized greeting
   */
  getPersonalizedGreeting(profile) {
    if (!profile || !profile.metadata) {
      return "Hi! How can I help you today?";
    }

    const metadata = profile.metadata;
    const visitCount = metadata.visitCount || 1;
    const name = profile.name || 'there';

    if (visitCount === 1) {
      return `Hi ${name}! Welcome! How can I help you today?`;
    } else if (visitCount < 5) {
      return `Hi ${name}! Good to see you again! What can I help you with?`;
    } else {
      return `Welcome back, ${name}! What can I do for you today?`;
    }
  }

  /**
   * Check if customer should get proactive nudge
   */
  shouldShowProactiveNudge(profile) {
    if (!profile || !profile.metadata) return false;

    const metadata = profile.metadata;
    const lastSeen = new Date(metadata.lastSeen);
    const minutesSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60);

    // Show nudge if:
    // 1. Returning customer (visitCount > 1)
    // 2. Been away for more than 24 hours
    if (metadata.visitCount > 1 && minutesSinceLastSeen > 1440) {
      return {
        show: true,
        type: 'returning_customer',
        message: `Welcome back! Last time we talked about ${this.getLastTopic(metadata)}. Need help with anything else?`
      };
    }

    return { show: false };
  }

  /**
   * Get last conversation topic
   */
  getLastTopic(metadata) {
    const topics = metadata?.history?.topics || [];
    if (topics.length === 0) return 'your order';
    
    const lastTopic = topics[topics.length - 1];
    return lastTopic.topic || 'your request';
  }

  /**
   * Clear session cache (cleanup)
   */
  clearCache() {
    this.sessionCache.clear();
    console.log('🧹 Customer profile cache cleared');
  }
}

// Export singleton
export const customerProfileService = new CustomerProfileService();
export default customerProfileService;
