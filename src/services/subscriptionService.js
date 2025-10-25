// Subscription Service - Feature Access Control
import dbService from './dbService';

class SubscriptionService {
  constructor() {
    this.cache = {
      subscription: null,
      addons: null,
      lastFetch: null
    };
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get organization's subscription details
   */
  async getSubscription(organizationId) {
    // Return cached data if recent
    if (this.cache.subscription && 
        this.cache.lastFetch && 
        Date.now() - this.cache.lastFetch < this.CACHE_DURATION) {
      return this.cache.subscription;
    }

    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'subscription/get',
          organizationId
        })
      });

      if (!response.ok) throw new Error('Failed to fetch subscription');
      
      const data = await response.json();
      this.cache.subscription = data;
      this.cache.lastFetch = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Get organization's active add-ons
   */
  async getAddons(organizationId) {
    if (this.cache.addons && 
        this.cache.lastFetch && 
        Date.now() - this.cache.lastFetch < this.CACHE_DURATION) {
      return this.cache.addons;
    }

    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'subscription/addons',
          organizationId
        })
      });

      if (!response.ok) throw new Error('Failed to fetch addons');
      
      const data = await response.json();
      this.cache.addons = data;
      
      return data;
    } catch (error) {
      console.error('Error fetching addons:', error);
      return [];
    }
  }

  /**
   * Check if organization has access to a specific feature
   */
  async hasFeatureAccess(organizationId, featureKey) {
    const subscription = await this.getSubscription(organizationId);
    const addons = await this.getAddons(organizationId);

    if (!subscription) return false;

    // Check if feature is in subscription plan
    const planFeatures = subscription.plan?.features || [];
    if (planFeatures.includes(featureKey)) return true;

    // Check if feature is in any active add-on
    for (const addon of addons) {
      if (addon.features?.includes(featureKey)) return true;
    }

    return false;
  }

  /**
   * Check usage limits for a feature
   */
  async checkUsageLimit(organizationId, featureKey) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'subscription/check-limit',
          organizationId,
          featureKey
        })
      });

      if (!response.ok) throw new Error('Failed to check usage limit');
      
      return await response.json();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, usage: 0, limit: 0 };
    }
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans() {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'subscription/plans'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch plans');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  }

  /**
   * Get all available add-ons
   */
  async getAvailableAddons() {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'subscription/available-addons'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch addons');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available addons:', error);
      return [];
    }
  }

  /**
   * Clear cache (call after subscription changes)
   */
  clearCache() {
    this.cache = {
      subscription: null,
      addons: null,
      lastFetch: null
    };
  }

  /**
   * Feature definitions for UI display
   */
  getFeatureDefinitions() {
    return {
      // Core features (always available in some plan)
      chat_widget: {
        name: 'Chat Widget',
        description: 'Embed chat widget on your website',
        icon: '💬'
      },
      knowledge_base: {
        name: 'Knowledge Base',
        description: 'Create and manage FAQ articles',
        icon: '📚'
      },
      custom_forms: {
        name: 'Custom Forms',
        description: 'Collect customer information',
        icon: '📋'
      },
      scenarios: {
        name: 'Conversation Scenarios',
        description: 'Pre-built conversation flows',
        icon: '🎭'
      },
      basic_analytics: {
        name: 'Basic Analytics',
        description: 'View conversation metrics',
        icon: '📊'
      },
      advanced_analytics: {
        name: 'Advanced Analytics',
        description: 'Detailed reports and insights',
        icon: '📈',
        requiresPlan: 'professional'
      },
      integrations: {
        name: 'Integrations',
        description: 'Connect with third-party tools',
        icon: '🔌',
        requiresPlan: 'professional'
      },
      custom_branding: {
        name: 'Custom Branding',
        description: 'Customize colors, fonts, and logos',
        icon: '🎨',
        requiresPlan: 'professional'
      },
      api_access: {
        name: 'API Access',
        description: 'Full REST API access',
        icon: '🔑',
        requiresPlan: 'professional'
      },
      white_label: {
        name: 'White Label',
        description: 'Remove all branding',
        icon: '🏷️',
        requiresPlan: 'business'
      },
      
      // Add-on features
      crm_dashboard: {
        name: 'CRM Dashboard',
        description: 'Full customer relationship management',
        icon: '👥',
        isAddon: true,
        addonName: 'crm'
      },
      contact_management: {
        name: 'Contact Management',
        description: 'Organize and manage contacts',
        icon: '📇',
        isAddon: true,
        addonName: 'crm'
      },
      phone_channel: {
        name: 'Phone Support',
        description: 'Handle calls through the platform',
        icon: '📞',
        isAddon: true,
        addonName: 'phone'
      },
      sms_channel: {
        name: 'SMS Messaging',
        description: 'Send and receive SMS',
        icon: '💬',
        isAddon: true,
        addonName: 'sms'
      },
      exit_intent: {
        name: 'Exit Intent Popups',
        description: 'Trigger messages when users try to leave',
        icon: '🚪',
        isAddon: true,
        addonName: 'proactive'
      },
      scroll_triggers: {
        name: 'Scroll Triggers',
        description: 'Show messages based on scroll position',
        icon: '📜',
        isAddon: true,
        addonName: 'proactive'
      },
      cart_abandonment: {
        name: 'Cart Abandonment',
        description: 'Recover abandoned carts',
        icon: '🛒',
        isAddon: true,
        addonName: 'proactive'
      }
    };
  }

  /**
   * Get plan tier level (for comparison)
   */
  getPlanLevel(planName) {
    const levels = {
      starter: 1,
      professional: 2,
      business: 3
    };
    return levels[planName] || 0;
  }

  /**
   * Check if upgrade is needed for a feature
   */
  async requiresUpgrade(organizationId, featureKey) {
    const hasAccess = await this.hasFeatureAccess(organizationId, featureKey);
    const definition = this.getFeatureDefinitions()[featureKey];
    
    if (hasAccess) {
      return { required: false };
    }

    if (definition?.isAddon) {
      return {
        required: true,
        type: 'addon',
        addonName: definition.addonName,
        message: `This feature requires the ${definition.name} add-on`
      };
    }

    if (definition?.requiresPlan) {
      return {
        required: true,
        type: 'plan',
        requiredPlan: definition.requiresPlan,
        message: `This feature requires the ${definition.requiresPlan} plan or higher`
      };
    }

    return {
      required: true,
      message: 'This feature is not available in your current plan'
    };
  }
}

export default new SubscriptionService();
