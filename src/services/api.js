import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Safe Supabase client with null check
let supabaseClient = null;
try {
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.warn('Supabase client creation failed:', error);
}

// ✅ Safe proxy that prevents null reference errors
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!supabaseClient) {
      console.warn(`Supabase not available - ${prop} call skipped`);
      // Return safe mock for common operations
      if (prop === 'auth') {
        return {
          signUp: async () => ({ data: null, error: { message: 'Auth not available' } }),
          signIn: async () => ({ data: null, error: { message: 'Auth not available' } }),
          signInWithPassword: async () => ({ data: null, error: { message: 'Auth not available' } }),
          signOut: async () => ({ error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          updateUser: async () => ({ data: null, error: { message: 'Auth not available' } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
          insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
        });
      }
      return () => {};
    }
    return supabaseClient[prop];
  }
});

// Authentication Service
export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Update user profile
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    return { data, error };
  }
};

// Organization Service
export const organizationService = {
  // Create new organization
  async create(orgData) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([orgData])
      .select()
      .single();
    return { data, error };
  },

  // Get user's organizations
  async getUserOrganizations(userId) {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          settings,
          created_at
        )
      `)
      .eq('user_id', userId);
    return { data, error };
  },

  // Get organization by ID
  async getById(orgId) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    return { data, error };
  },

  // Update organization
  async update(orgId, updates) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single();
    return { data, error };
  },

  // Add member to organization
  async addMember(orgId, userId, role = 'agent') {
    const { data, error } = await supabase
      .from('organization_members')
      .insert([{
        organization_id: orgId,
        user_id: userId,
        role
      }])
      .select();
    return { data, error };
  }
};

// Conversation Service
export const conversationService = {
  // Get conversations for organization
  async getConversations(orgId, filters = {}) {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:profiles(id, full_name, avatar_url),
        messages(id, content, sender_type, created_at)
      `)
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get single conversation
  async getConversation(conversationId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:profiles(id, full_name, avatar_url),
        messages(
          id,
          content,
          sender_type,
          sender_id,
          message_type,
          metadata,
          created_at,
          sender:profiles(id, full_name, avatar_url)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (data) {
      // Sort messages by created_at
      data.messages = data.messages.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );
    }

    return { data, error };
  },

  // Create new conversation
  async create(conversationData) {
    const { data, error } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single();
    return { data, error };
  },

  // Update conversation
  async update(conversationId, updates) {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    return { data, error };
  },

  // Assign conversation to agent
  async assign(conversationId, agentId) {
    return this.update(conversationId, {
      assigned_to: agentId,
      status: 'open'
    });
  },

  // Close conversation
  async close(conversationId) {
    return this.update(conversationId, {
      status: 'closed'
    });
  },

  // Subscribe to conversation updates
  subscribeToConversations(orgId, callback) {
    if (!supabaseClient) return { unsubscribe: () => {} };
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `organization_id=eq.${orgId}`
      }, callback)
      .subscribe();
  }
};

// Message Service
export const messageService = {
  // Send message
  async send(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...messageData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (!error) {
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id);
    }

    return { data, error };
  },

  // Get messages for conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data: data?.reverse(), error };
  },

  // Subscribe to new messages
  subscribeToMessages(conversationId, callback) {
    if (!supabaseClient) return { unsubscribe: () => {} };
    return supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  },

  // Mark messages as read
  async markAsRead(conversationId, userId) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null);

    return { error };
  }
};

// Customer Service
export const customerService = {
  // Create or get customer
  async createOrGet(customerData) {
    // First try to find existing customer
    let { data: existingCustomer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email)
      .eq('organization_id', customerData.organization_id)
      .single();

    if (existingCustomer) {
      return { data: existingCustomer, error: null };
    }

    // Create new customer
    const { data, error: createError } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    return { data, error: createError };
  },

  // Get customers for organization
  async getCustomers(orgId, search = '') {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Update customer
  async update(customerId, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();
    return { data, error };
  }
};

// Analytics Service
export const analyticsService = {
  // Get conversation stats
  async getConversationStats(orgId, timeframe = '7d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const { data, error } = await supabase
      .from('conversations')
      .select('status, created_at, resolved_at')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString());

    if (error) return { data: null, error };

    // Process stats
    const stats = {
      total: data.length,
      open: data.filter(c => c.status === 'open').length,
      closed: data.filter(c => c.status === 'closed').length,
      avgResolutionTime: 0
    };

    // Calculate average resolution time
    const resolvedConversations = data.filter(c => c.resolved_at);
    if (resolvedConversations.length > 0) {
      const totalResolutionTime = resolvedConversations.reduce((sum, conv) => {
        const created = new Date(conv.created_at);
        const resolved = new Date(conv.resolved_at);
        return sum + (resolved - created);
      }, 0);
      stats.avgResolutionTime = totalResolutionTime / resolvedConversations.length;
    }

    return { data: stats, error: null };
  },

  // Get message volume over time
  async getMessageVolume(orgId, timeframe = '7d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const { data, error } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    if (error) return { data: null, error };

    // Group by day
    const dailyVolume = {};
    data.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      dailyVolume[date] = (dailyVolume[date] || 0) + 1;
    });

    const chartData = Object.entries(dailyVolume).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      messages: count
    }));

    return { data: chartData, error: null };
  },

  // Get agent performance
  async getAgentPerformance(orgId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        assigned_to,
        status,
        created_at,
        resolved_at,
        assigned_agent:profiles(full_name)
      `)
      .eq('organization_id', orgId)
      .not('assigned_to', 'is', null);

    if (error) return { data: null, error };

    // Process agent stats
    const agentStats = {};
    data.forEach(conv => {
      const agentId = conv.assigned_to;
      if (!agentStats[agentId]) {
        agentStats[agentId] = {
          name: conv.assigned_agent?.full_name || 'Unknown',
          totalConversations: 0,
          resolvedConversations: 0,
          avgResolutionTime: 0,
          resolutionTimes: []
        };
      }

      agentStats[agentId].totalConversations++;

      if (conv.status === 'closed' && conv.resolved_at) {
        agentStats[agentId].resolvedConversations++;
        const resolutionTime = new Date(conv.resolved_at) - new Date(conv.created_at);
        agentStats[agentId].resolutionTimes.push(resolutionTime);
      }
    });

    // Calculate averages
    Object.values(agentStats).forEach(agent => {
      if (agent.resolutionTimes.length > 0) {
        agent.avgResolutionTime = agent.resolutionTimes.reduce((a, b) => a + b, 0) / agent.resolutionTimes.length;
      }
      delete agent.resolutionTimes;
    });

    return { data: Object.values(agentStats), error: null };
  }
};

// Bot Service
export const botService = {
  // Get bot flows for organization
  async getBotFlows(orgId) {
    const { data, error } = await supabase
      .from('bot_flows')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Create bot flow
  async createFlow(flowData) {
    const { data, error } = await supabase
      .from('bot_flows')
      .insert([flowData])
      .select()
      .single();
    return { data, error };
  },

  // Update bot flow
  async updateFlow(flowId, updates) {
    const { data, error } = await supabase
      .from('bot_flows')
      .update(updates)
      .eq('id', flowId)
      .select()
      .single();
    return { data, error };
  },

  // Process bot response
  async processMessage(message, orgId) {
    try {
      // Get active bot flows for organization
      const { data: flows } = await supabase
        .from('bot_flows')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (!flows || flows.length === 0) {
        return null;
      }

      // Simple keyword matching for demo
      const messageText = message.toLowerCase();

      for (const flow of flows) {
        const triggers = flow.triggers || [];
        const matchedTrigger = triggers.find(trigger =>
          messageText.includes(trigger.toLowerCase())
        );

        if (matchedTrigger) {
          return {
            response: flow.responses?.[0] || "I'm here to help!",
            flowId: flow.id,
            action: flow.actions?.[0] || null
          };
        }
      }

      // Default response
      return {
        response: "Thanks for your message! A team member will be with you shortly.",
        flowId: null,
        action: null
      };

    } catch (error) {
      console.error('Bot processing error:', error);
      return null;
    }
  }
};

// File Upload Service
export const fileService = {
  // Upload file to Supabase Storage
  async uploadFile(file, path) {
    if (!supabaseClient) {
      return { data: null, error: { message: 'Storage not available' } };
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file);

    if (error) return { data: null, error };

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return {
      data: {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      },
      error: null
    };
  },

  // Delete file
  async deleteFile(path) {
    if (!supabaseClient) {
      return { error: { message: 'Storage not available' } };
    }
    
    const { error } = await supabase.storage
      .from('chat-attachments')
      .remove([path]);
    return { error };
  }
};

// Integration Service
export const integrationService = {
  // Get integrations for organization
  async getIntegrations(orgId) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', orgId);
    return { data, error };
  },

  // Create integration
  async createIntegration(integrationData) {
    const { data, error } = await supabase
      .from('integrations')
      .insert([integrationData])
      .select()
      .single();
    return { data, error };
  },

  // Update integration
  async updateIntegration(integrationId, updates) {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', integrationId)
      .select()
      .single();
    return { data, error };
  },

  // Test integration connection
  async testConnection(integration) {
    try {
      // Implementation depends on integration type
      switch (integration.type) {
        case 'shopify':
          return await this.testShopifyConnection(integration.config);
        case 'slack':
          return await this.testSlackConnection(integration.config);
        default:
          return { success: false, error: 'Unknown integration type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Test Shopify connection
  async testShopifyConnection(config) {
    const response = await fetch(`https://${config.shop}.myshopify.com/admin/api/2023-04/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': config.accessToken
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid Shopify credentials' };
    }
  },

  // Test Slack connection
  async testSlackConnection(config) {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${config.botToken}`
      }
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  }
};

// Notification Service
export const notificationService = {
  // Send email notification
  async sendEmail(to, subject, content, orgId) {
    if (!supabaseClient) {
      return { data: null, error: { message: 'Functions not available' } };
    }
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        content,
        organizationId: orgId
      }
    });
    return { data, error };
  },

  // Send SMS notification
  async sendSMS(to, message, orgId) {
    if (!supabaseClient) {
      return { data: null, error: { message: 'Functions not available' } };
    }
    
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to,
        message,
        organizationId: orgId
      }
    });
    return { data, error };
  },

  // Create in-app notification
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    return { data, error };
  },

  // Get user notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  }
};

// Export all services
export default {
  auth: authService,
  organizations: organizationService,
  conversations: conversationService,
  messages: messageService,
  customers: customerService,
  analytics: analyticsService,
  bots: botService,
  files: fileService,
  integrations: integrationService,
  notifications: notificationService,
  supabase
};