import { supabase } from '../supabase';

// Multi-User Kustomer OAuth Service
class KustomerOAuthService {
  constructor() {
    this.currentUser = null;
    this.currentConnection = null;
    this.apiCache = new Map();
    this.rateLimitTracker = new Map();
    
    // OAuth Configuration
    this.oauthConfig = {
      clientId: import.meta.env.VITE_KUSTOMER_CLIENT_ID,
      clientSecret: import.meta.env.KUSTOMER_CLIENT_SECRET, // Server-side only
      redirectUri: `${window.location.origin}/auth/kustomer/callback`,
      scope: 'customers:read customers:write conversations:read conversations:write messages:write notes:write teams:read',
      authUrl: 'https://api.kustomerapp.com/oauth/authorize',
      tokenUrl: 'https://api.kustomerapp.com/oauth/token'
    };
  }

  // Initialize service with current user
  async initialize(user) {
    this.currentUser = user;
    if (user) {
      await this.loadUserConnection(user.id);
    }
  }

  // Load user's active Kustomer connection
  async loadUserConnection(userId) {
    try {
      const { data, error } = await supabase
        .from('user_kustomer_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'connected')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        this.currentConnection = data[0];
        return this.currentConnection;
      }

      return null;
    } catch (error) {
      console.error('Error loading user Kustomer connection:', error);
      return null;
    }
  }

  // Check if user has active Kustomer connection
  isConnected() {
    return this.currentConnection && this.currentConnection.status === 'connected';
  }

  // Get user's Kustomer connections
  async getUserConnections(userId) {
    try {
      const { data, error } = await supabase
        .from('user_kustomer_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user connections:', error);
      return [];
    }
  }

  // Switch to specific connection
  async switchConnection(connectionId) {
    try {
      const { data, error } = await supabase
        .from('user_kustomer_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', this.currentUser.id)
        .eq('status', 'connected')
        .single();

      if (error) throw error;

      this.currentConnection = data;
      return data;
    } catch (error) {
      console.error('Error switching connection:', error);
      throw error;
    }
  }

  // Generate OAuth URL for authentication
  generateOAuthUrl(userId) {
    const state = this.generateSecureState(userId);
    
    const authUrl = new URL(this.oauthConfig.authUrl);
    authUrl.searchParams.append('client_id', this.oauthConfig.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.oauthConfig.scope);
    authUrl.searchParams.append('redirect_uri', this.oauthConfig.redirectUri);
    authUrl.searchParams.append('state', state);

    return authUrl.toString();
  }

  // Generate secure state for OAuth
  generateSecureState(userId) {
    const stateData = {
      timestamp: Date.now(),
      userId: userId,
      random: Math.random().toString(36).substring(2, 15)
    };
    
    const state = btoa(JSON.stringify(stateData));
    
    // Store state in database for verification
    this.storeOAuthState(state, userId);
    
    return state;
  }

  // Store OAuth state for verification
  async storeOAuthState(state, userId) {
    try {
      const { error } = await supabase
        .from('kustomer_oauth_states')
        .insert({
          state_token: state,
          user_id: userId,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing OAuth state:', error);
    }
  }

  // Verify OAuth state
  async verifyOAuthState(state) {
    try {
      const { data, error } = await supabase
        .from('kustomer_oauth_states')
        .select('*')
        .eq('state_token', state)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      // Mark as used
      await supabase
        .from('kustomer_oauth_states')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error verifying OAuth state:', error);
      return null;
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(code, state) {
    try {
      // Verify state
      const stateData = await this.verifyOAuthState(state);
      if (!stateData) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      // Get user info from Kustomer
      const userInfo = await this.getKustomerUserInfo(tokenResponse.access_token, tokenResponse.subdomain);
      
      // Store connection in database
      const connection = await this.storeUserConnection(
        stateData.user_id,
        tokenResponse,
        userInfo
      );

      return {
        success: true,
        connection: connection,
        user: userInfo
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Exchange authorization code for access tokens
  async exchangeCodeForTokens(code) {
    try {
      // This would be handled by your backend API
      const response = await fetch('/api/kustomer/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: this.oauthConfig.redirectUri,
          client_id: this.oauthConfig.clientId,
          client_secret: this.oauthConfig.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Get Kustomer user information
  async getKustomerUserInfo(accessToken, subdomain) {
    try {
      const response = await fetch(`https://${subdomain}.api.kustomerapp.com/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting Kustomer user info:', error);
      throw error;
    }
  }

  // Store user connection in database
  async storeUserConnection(userId, tokenData, userInfo) {
    try {
      const { data, error } = await supabase
        .from('user_kustomer_connections')
        .insert({
          user_id: userId,
          kustomer_user_id: userInfo.id,
          kustomer_user_email: userInfo.attributes.email,
          kustomer_user_name: userInfo.attributes.displayName || userInfo.attributes.email,
          kustomer_organization_id: userInfo.relationships?.organization?.data?.id,
          subdomain: tokenData.subdomain,
          connection_type: 'oauth',
          access_token_encrypted: this.encryptToken(tokenData.access_token),
          refresh_token_encrypted: tokenData.refresh_token ? this.encryptToken(tokenData.refresh_token) : null,
          token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          permissions: this.oauthConfig.scope.split(' '),
          scope: this.oauthConfig.scope,
          status: 'connected',
          last_sync: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      this.currentConnection = data;
      return data;
    } catch (error) {
      console.error('Error storing user connection:', error);
      throw error;
    }
  }

  // Simple token encryption (use proper encryption in production)
  encryptToken(token) {
    // In production, use proper encryption like AES
    return btoa(token);
  }

  // Simple token decryption (use proper decryption in production)
  decryptToken(encryptedToken) {
    // In production, use proper decryption
    return atob(encryptedToken);
  }

  // Get decrypted access token for API calls
  async getAccessToken() {
    if (!this.isConnected()) {
      throw new Error('No active Kustomer connection');
    }

    // Check if token is expired and refresh if needed
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    return this.decryptToken(this.currentConnection.access_token_encrypted);
  }

  // Check if access token is expired
  isTokenExpired() {
    if (!this.currentConnection.token_expires_at) {
      return false; // No expiration set
    }

    const expiresAt = new Date(this.currentConnection.token_expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return (expiresAt.getTime() - bufferTime) <= now.getTime();
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.currentConnection.refresh_token_encrypted) {
      throw new Error('No refresh token available');
    }

    try {
      const refreshToken = this.decryptToken(this.currentConnection.refresh_token_encrypted);
      
      const response = await fetch('/api/kustomer/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: this.oauthConfig.clientId,
          client_secret: this.oauthConfig.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();

      // Update connection with new tokens
      const { error } = await supabase
        .from('user_kustomer_connections')
        .update({
          access_token_encrypted: this.encryptToken(tokenData.access_token),
          refresh_token_encrypted: tokenData.refresh_token ? this.encryptToken(tokenData.refresh_token) : this.currentConnection.refresh_token_encrypted,
          token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentConnection.id);

      if (error) throw error;

      // Update local connection
      this.currentConnection.access_token_encrypted = this.encryptToken(tokenData.access_token);
      if (tokenData.refresh_token) {
        this.currentConnection.refresh_token_encrypted = this.encryptToken(tokenData.refresh_token);
      }
      this.currentConnection.token_expires_at = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null;

    } catch (error) {
      console.error('Error refreshing access token:', error);
      
      // Mark connection as expired
      await this.markConnectionExpired(error.message);
      throw error;
    }
  }

  // Mark connection as expired
  async markConnectionExpired(errorMessage) {
    try {
      await supabase
        .from('user_kustomer_connections')
        .update({
          status: 'expired',
          last_error: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentConnection.id);

      this.currentConnection = null;
    } catch (error) {
      console.error('Error marking connection as expired:', error);
    }
  }

  // Make authenticated API request to Kustomer
  async makeApiRequest(endpoint, options = {}) {
    if (!this.isConnected()) {
      throw new Error('No active Kustomer connection');
    }

    try {
      const accessToken = await this.getAccessToken();
      const baseUrl = `https://${this.currentConnection.subdomain}.api.kustomerapp.com/v1`;
      
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // Track API usage
      await this.trackApiUsage(endpoint, response.status);

      if (response.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshAccessToken();
        
        // Retry with new token
        const newAccessToken = await this.getAccessToken();
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Kustomer API request error:', error);
      throw error;
    }
  }

  // Track API usage for analytics and rate limiting
  async trackApiUsage(endpoint, statusCode) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const endpointType = this.categorizeEndpoint(endpoint);
      
      // Upsert usage record
      const { error } = await supabase.rpc('increment_api_usage', {
        p_user_id: this.currentUser.id,
        p_connection_id: this.currentConnection.id,
        p_date: today,
        p_endpoint_type: endpointType,
        p_status_code: statusCode
      });

      if (error) {
        console.error('Error tracking API usage:', error);
      }
    } catch (error) {
      console.error('Error in trackApiUsage:', error);
    }
  }

  // Categorize endpoint for usage tracking
  categorizeEndpoint(endpoint) {
    if (endpoint.includes('/customers')) return 'customers';
    if (endpoint.includes('/conversations')) return 'conversations';
    if (endpoint.includes('/messages')) return 'messages';
    if (endpoint.includes('/notes')) return 'notes';
    if (endpoint.includes('/teams')) return 'teams';
    return 'other';
  }

  // Disconnect user's Kustomer account
  async disconnect(connectionId = null) {
    const id = connectionId || this.currentConnection?.id;
    if (!id) return;

    try {
      const { error } = await supabase
        .from('user_kustomer_connections')
        .update({
          status: 'disconnected',
          disconnected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      if (id === this.currentConnection?.id) {
        this.currentConnection = null;
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting Kustomer account:', error);
      throw error;
    }
  }

  // Customer Methods - using user's connection
  async findCustomer(email) {
    const response = await this.makeApiRequest(`/customers?filter[email]=${encodeURIComponent(email)}&pageSize=1`);
    return response.data && response.data.length > 0 ? response.data[0] : null;
  }

  async createCustomer(customerData) {
    const customer = {
      type: 'customer',
      attributes: {
        name: customerData.name || 'Chat Customer',
        emails: [{ email: customerData.email, verified: false }]
      }
    };

    if (customerData.phone) {
      customer.attributes.phones = [{ phone: customerData.phone }];
    }

    const response = await this.makeApiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify({ data: customer })
    });

    return response.data;
  }

  // Conversation Methods - using user's connection
  async createConversation(customerId, subject = null, channel = 'chat') {
    const conversation = {
      type: 'conversation',
      attributes: {
        subject: subject || 'Chat Conversation',
        channels: [channel],
        priority: 2, // Medium priority
        source: 'api',
        status: 'open'
      },
      relationships: {
        customer: {
          data: { type: 'customer', id: customerId }
        }
      }
    };

    const response = await this.makeApiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ data: conversation })
    });

    return response.data;
  }

  async createMessage(conversationId, body, direction = 'in', channel = 'chat') {
    const message = {
      type: 'message',
      attributes: {
        body: body,
        direction: direction,
        channel: channel
      },
      relationships: {
        conversation: {
          data: { type: 'conversation', id: conversationId }
        }
      }
    };

    const response = await this.makeApiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ data: message })
    });

    return response.data;
  }

  // Get user's API usage statistics
  async getApiUsageStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('user_kustomer_api_usage')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('connection_id', this.currentConnection.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return this.aggregateUsageStats(data || []);
    } catch (error) {
      console.error('Error getting API usage stats:', error);
      return null;
    }
  }

  // Aggregate usage statistics
  aggregateUsageStats(usageData) {
    const totals = {
      totalCalls: 0,
      totalErrors: 0,
      rateLimitHits: 0,
      byEndpoint: {},
      dailyUsage: usageData
    };

    usageData.forEach(day => {
      totals.totalCalls += day.api_calls_count || 0;
      totals.totalErrors += day.error_count || 0;
      totals.rateLimitHits += day.rate_limit_hits || 0;
      
      // Aggregate by endpoint type
      ['customers', 'conversations', 'messages', 'notes'].forEach(endpoint => {
        const key = `${endpoint}_calls`;
        if (!totals.byEndpoint[endpoint]) {
          totals.byEndpoint[endpoint] = 0;
        }
        totals.byEndpoint[endpoint] += day[key] || 0;
      });
    });

    return totals;
  }
}

// Export singleton instance
export const kustomerOAuthService = new KustomerOAuthService();
export default kustomerOAuthService;