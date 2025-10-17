// ===================================================================
// CONSOLIDATED API - Single endpoint for ALL operations
// This reduces serverless functions from ~20 to just 1
// ===================================================================

import { getDatabase } from './database-config.js';

let sql;
try {
  sql = getDatabase();
  console.log('✅ Database connection ready');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  // Don't throw here, let individual requests handle the error
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(200).json({ ok: true });
  }

  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  const { method, query, body } = req;
  const endpoint = query.endpoint || body?.endpoint;
  const action = body?.action;

  try {
    // ============================================================
    // HEALTH CHECK (GET or HEAD)
    // ============================================================
    if ((method === 'GET' || method === 'HEAD') && (query.check === '1' || !endpoint)) {
      if (method === 'HEAD') {
        return res.status(200).end();
      }
      return res.status(200).json({ 
        status: 'healthy',
        version: '2.0.0',
        endpoints: ['database', 'health'],
        timestamp: new Date().toISOString()
      });
    }

    // ============================================================
    // DATABASE OPERATIONS
    // ============================================================
    if (endpoint === 'database' || !endpoint) {
      
      // ==================== CONNECTION TEST ====================
      if (action === 'testConnection') {
        try {
          // Test database connection by running a simple query
          await sql`SELECT 1 as test`;
          return res.status(200).json({ 
            success: true, 
            connected: true,
            message: 'Database connection successful',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return res.status(500).json({ 
            success: false, 
            connected: false,
            error: error.message,
            message: 'Database connection failed'
          });
        }
      }
      
      // ==================== CONVERSATIONS ====================
      if ((method === 'GET' && query.type === 'conversations') || action === 'get_conversations') {
        const limit = parseInt(query.limit || body?.limit || 50);
        const conversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC LIMIT ${limit}`;
        return res.status(200).json({ success: true, conversations });
      }

      if (action === 'create_conversation') {
        const { customer_email, customer_name, customer_phone, channel, status } = body;
        const result = await sql`
          INSERT INTO conversations (customer_email, customer_name, customer_phone, channel, status)
          VALUES (${customer_email}, ${customer_name}, ${customer_phone}, ${channel || 'web'}, ${status || 'active'})
          RETURNING *
        `;
        return res.status(201).json({ success: true, conversation: result[0] });
      }

      // Delete single conversation
      if (action === 'delete_conversation') {
        const { conversationId } = body;
        if (!conversationId) return res.status(400).json({ success: false, error: 'conversationId required' });
        
        // First delete all messages for this conversation
        await sql`DELETE FROM messages WHERE conversation_id = ${conversationId}`;
        
        // Then delete the conversation
        await sql`DELETE FROM conversations WHERE id = ${conversationId}`;
        
        return res.status(200).json({ success: true, message: 'Conversation deleted' });
      }

      // Clear all conversations for an organization
      if (action === 'clear_all_conversations') {
        const { orgId } = body;
        if (!orgId) return res.status(400).json({ success: false, error: 'orgId required' });
        
        // Get all conversation IDs for this org
        const conversations = await sql`SELECT id FROM conversations WHERE organization_id = ${orgId}`;
        const conversationIds = conversations.map(c => c.id);
        
        // Delete all messages for these conversations
        if (conversationIds.length > 0) {
          await sql`DELETE FROM messages WHERE conversation_id = ANY(${conversationIds})`;
        }
        
        // Delete all conversations for this org
        const result = await sql`DELETE FROM conversations WHERE organization_id = ${orgId}`;
        
        return res.status(200).json({ success: true, deleted: result.rowCount || 0, message: 'All conversations cleared' });
      }

      // ==================== MESSAGES ====================
      if ((method === 'GET' && query.type === 'messages') || action === 'get_messages') {
        const conversationId = query.conversation_id || body?.conversationId || body?.conversation_id;
        if (!conversationId) return res.status(400).json({ success: false, error: 'conversation_id required', messages: [] });
        
        const messages = await sql`
          SELECT * FROM messages 
          WHERE conversation_id = ${conversationId}
          ORDER BY created_at ASC
        `;
        return res.status(200).json({ success: true, messages });
      }

      if (action === 'create_message') {
        const { conversation_id, sender_type, content, metadata } = body;
        const result = await sql`
          INSERT INTO messages (conversation_id, sender_type, content, metadata)
          VALUES (${conversation_id}, ${sender_type}, ${content}, ${metadata ? JSON.stringify(metadata) : '{}'})
          RETURNING *
        `;
        return res.status(201).json({ success: true, message: result[0] });
      }

      // ==================== PROACTIVE TRIGGERS ====================
      if (action === 'getProactiveTriggers') {
        const { orgId } = body;
        const triggers = await sql`
          SELECT * FROM proactive_triggers
          WHERE organization_id = ${orgId}
          ORDER BY priority DESC, created_at DESC
        `;
        return res.status(200).json({ success: true, data: triggers });
      }

      if (action === 'saveProactiveTrigger') {
        const { organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config } = body;
        const result = await sql`
          INSERT INTO proactive_triggers
            (organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config)
          VALUES (${organization_id}, ${name}, ${trigger_type}, ${message}, ${delay_seconds || 0}, ${priority || 5}, ${JSON.stringify(conditions || {})}, ${JSON.stringify(action_config || {})})
          RETURNING *
        `;
        return res.status(201).json({ success: true, data: result[0] });
      }

      if (action === 'updateProactiveTrigger') {
        const { triggerId, updates } = body;
        const result = await sql`
          UPDATE proactive_triggers
          SET
            name = COALESCE(${updates.name}, name),
            message = COALESCE(${updates.message}, message),
            delay_seconds = COALESCE(${updates.delay_seconds}, delay_seconds),
            priority = COALESCE(${updates.priority}, priority),
            conditions = COALESCE(${updates.conditions ? JSON.stringify(updates.conditions) : null}, conditions),
            action_config = COALESCE(${updates.action_config ? JSON.stringify(updates.action_config) : null}, action_config),
            updated_at = NOW()
          WHERE id = ${triggerId}
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: result[0] });
      }

      if (action === 'deleteProactiveTrigger') {
        const { triggerId } = body;
        await sql`DELETE FROM proactive_triggers WHERE id = ${triggerId}`;
        return res.status(200).json({ success: true });
      }

      if (action === 'toggleProactiveTrigger') {
        const { triggerId, enabled } = body;
        const result = await sql`
          UPDATE proactive_triggers
          SET enabled = ${enabled}, updated_at = NOW()
          WHERE id = ${triggerId}
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: result[0] });
      }

      if (action === 'getProactiveTriggerStats') {
        const { orgId, startDate, endDate } = body;
        const stats = await sql`
          SELECT
            pt.id, pt.name,
            COUNT(pts.id) as total_triggers,
            SUM(CASE WHEN pts.resulted_in_conversion THEN 1 ELSE 0 END) as conversions,
            CASE WHEN COUNT(pts.id) > 0
              THEN (SUM(CASE WHEN pts.resulted_in_conversion THEN 1 ELSE 0 END)::float / COUNT(pts.id) * 100)
              ELSE 0
            END as conversion_rate
          FROM proactive_triggers pt
          LEFT JOIN proactive_trigger_stats pts ON pt.id = pts.trigger_id
            AND pts.triggered_at >= ${startDate} AND pts.triggered_at <= ${endDate}
          WHERE pt.organization_id = ${orgId}
          GROUP BY pt.id, pt.name
        `;
        return res.status(200).json({ success: true, data: stats });
      }

      // ==================== BOT CONFIGS ====================
      if (action === 'getBotConfigs') {
        const { orgId } = body;
        const configs = await sql`SELECT * FROM bot_configs WHERE organization_id = ${orgId}`;
        return res.status(200).json({ success: true, data: configs });
      }

      if (action === 'saveBotConfig' || action === 'updateBotConfig') {
        const { id, organization_id, name, personality, instructions, greeting_message, settings } = body;
        
        if (id) {
          const result = await sql`
            UPDATE bot_configs
            SET name = ${name}, personality = ${personality}, instructions = ${instructions},
                greeting_message = ${greeting_message}, settings = ${JSON.stringify(settings || {})},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
          `;
          return res.status(200).json({ success: true, data: result[0] });
        } else {
          const result = await sql`
            INSERT INTO bot_configs (organization_id, name, personality, instructions, greeting_message, settings)
            VALUES (${organization_id}, ${name}, ${personality}, ${instructions}, ${greeting_message}, ${JSON.stringify(settings || {})})
            RETURNING *
          `;
          return res.status(201).json({ success: true, data: result[0] });
        }
      }

      // ==================== INTEGRATIONS ====================
      if (action === 'getIntegrations') {
        const { orgId } = body;
        const integrations = await sql`SELECT * FROM integrations WHERE organization_id = ${orgId}`;
        return res.status(200).json({ success: true, data: integrations });
      }

      if (action === 'getIntegrationCredentials') {
        const { integration, organizationId } = body;
        try {
          const result = await sql`
            SELECT credentials_encrypted, config FROM integrations 
            WHERE organization_id = ${organizationId} 
            AND integration_id = ${integration}
            AND status = 'connected'
            LIMIT 1
          `;
          
          if (result.length === 0) {
            return res.status(200).json({ success: false, error: 'Integration not connected' });
          }
          
          const credentials = result[0].credentials_encrypted;
          return res.status(200).json({ 
            success: true, 
            credentials: typeof credentials === 'string' ? JSON.parse(credentials) : credentials
          });
        } catch (error) {
          console.error('Error getting integration credentials:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'saveIntegrationCredentials') {
        const { integration, credentials, organizationId } = body;
        try {
          console.log('💾 Saving integration credentials:', { integration, organizationId, hasCredentials: !!credentials });
          
          // Upsert the integration with credentials
          const result = await sql`
            INSERT INTO integrations (organization_id, integration_id, integration_name, status, config, credentials_encrypted)
            VALUES (
              ${organizationId}, 
              ${integration}, 
              ${integration === 'shopify' ? 'Shopify' : integration}, 
              'connected', 
              ${JSON.stringify({ connectedAt: new Date().toISOString() })},
              ${JSON.stringify(credentials)}
            )
            ON CONFLICT (organization_id, integration_id)
            DO UPDATE SET
              status = 'connected',
              credentials_encrypted = ${JSON.stringify(credentials)},
              updated_at = NOW()
            RETURNING *
          `;
          
          console.log('✅ Integration credentials saved successfully');
          return res.status(200).json({ success: true, data: result[0] });
        } catch (error) {
          console.error('❌ Error saving integration credentials:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'upsertIntegration') {
        const { organization_id, integration_id, integration_name, status, config, credentials_encrypted } = body;
        const result = await sql`
          INSERT INTO integrations (organization_id, integration_id, integration_name, status, config, credentials_encrypted)
          VALUES (${organization_id}, ${integration_id}, ${integration_name}, ${status}, ${JSON.stringify(config || {})}, ${credentials_encrypted})
          ON CONFLICT (organization_id, integration_id)
          DO UPDATE SET
            integration_name = EXCLUDED.integration_name,
            status = EXCLUDED.status,
            config = EXCLUDED.config,
            credentials_encrypted = EXCLUDED.credentials_encrypted,
            updated_at = NOW()
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: result[0] });
      }

      // ==================== ANALYTICS ====================
      if (action === 'createAnalyticsEvent') {
        const { organization_id, conversation_id, event_type, event_data } = body;
        const result = await sql`
          INSERT INTO analytics_events (organization_id, conversation_id, event_type, event_data)
          VALUES (${organization_id}, ${conversation_id}, ${event_type}, ${JSON.stringify(event_data || {})})
          RETURNING *
        `;
        return res.status(201).json({ success: true, data: result[0] });
      }

      if (action === 'getAnalytics') {
        const { orgId, startDate, endDate } = body;
        const events = await sql`
          SELECT * FROM analytics_events
          WHERE organization_id = ${orgId}
            AND created_at >= ${startDate}
            AND created_at <= ${endDate}
          ORDER BY created_at DESC
        `;
        return res.status(200).json({ success: true, data: events });
      }

      // ==================== CUSTOMERS ====================
      if (action === 'getCustomer') {
        const { organizationId, email } = body;
        const customers = await sql`
          SELECT * FROM customers
          WHERE organization_id = ${organizationId} AND email = ${email}
          LIMIT 1
        `;
        return res.status(200).json({ success: true, customer: customers[0] || null });
      }
      
      if (action === 'getCustomerConversations') {
        const { organizationId, customerEmail, limit = 10 } = body;
        const conversations = await sql`
          SELECT * FROM conversations
          WHERE organization_id = ${organizationId} AND customer_email = ${customerEmail}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
        return res.status(200).json({ success: true, conversations });
      }
      
      if (action === 'upsertCustomer') {
        const { organization_id, email, name, phone, metadata, tags } = body;
        const result = await sql`
          INSERT INTO customers (organization_id, email, name, phone, metadata, tags)
          VALUES (${organization_id}, ${email}, ${name}, ${phone}, ${JSON.stringify(metadata || {})}, ${tags || []})
          ON CONFLICT (organization_id, email)
          DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            metadata = EXCLUDED.metadata,
            tags = EXCLUDED.tags,
            updated_at = NOW()
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: result[0] });
      }

      // ==================== SHOPIFY OAUTH ====================
      if (action === 'shopify_oauth_initiate') {
        const { shop, organizationId } = body;
        try {
          // Generate OAuth URL with proper scopes including draft orders
          const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers,write_draft_orders';
          
          // Use configured redirect URI or construct from VERCEL_URL
          let redirectUri;
          if (process.env.SHOPIFY_REDIRECT_URI) {
            redirectUri = process.env.SHOPIFY_REDIRECT_URI;
          } else {
            const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';
            redirectUri = `${baseUrl}/shopify/callback`;
          }
          
          const nonce = Math.random().toString(36).substring(7);
          
          const authUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
          
          return res.status(200).json({ success: true, authUrl });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'shopify_oauth_callback') {
        const { code, shop, state, organizationId } = body;
        try {
          // Exchange code for access token
          const tokenUrl = `https://${shop}/admin/oauth/access_token`;
          const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: process.env.SHOPIFY_CLIENT_ID,
              client_secret: process.env.SHOPIFY_CLIENT_SECRET,
              code: code
            })
          });
          
          const tokenData = await tokenResponse.json();
          
          if (!tokenResponse.ok) {
            throw new Error(tokenData.error || 'Failed to get access token');
          }
          
          // Get shop info
          const shopInfoResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
            headers: {
              'X-Shopify-Access-Token': tokenData.access_token,
              'Content-Type': 'application/json'
            }
          });
          const shopInfoData = await shopInfoResponse.json();
          const shopInfo = shopInfoData.shop || {};
          
          // Save to database
          await sql`
            INSERT INTO integrations (organization_id, integration_id, integration_name, status, config, credentials_encrypted)
            VALUES (${organizationId}, 'shopify', 'Shopify', 'connected', ${JSON.stringify({ shop, shopInfo })}, ${JSON.stringify({ access_token: tokenData.access_token, shop })})
            ON CONFLICT (organization_id, integration_id)
            DO UPDATE SET
              status = EXCLUDED.status,
              config = EXCLUDED.config,
              credentials_encrypted = EXCLUDED.credentials_encrypted,
              updated_at = NOW()
          `;
          
          return res.status(200).json({ 
            success: true, 
            accessToken: tokenData.access_token,
            shopDomain: shop,
            scope: tokenData.scope,
            shopInfo: {
              name: shopInfo.name,
              email: shopInfo.email,
              domain: shopInfo.domain,
              currency: shopInfo.currency
            }
          });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      // ==================== SHOPIFY INTEGRATION ====================
      if (action === 'shopify_verifyCredentials') {
        const { store_url, access_token } = body;
        try {
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          // Try to fetch shop info to verify credentials
          const response = await fetch(`https://${fullStoreUrl}/admin/api/2024-01/shop.json`, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            return res.status(200).json({ success: false, error: 'Invalid credentials' });
          }
          
          const data = await response.json();
          return res.status(200).json({ success: true, shop: data.shop });
        } catch (error) {
          return res.status(200).json({ success: false, error: error.message });
        }
      }

      if (action === 'shopify_getProducts') {
        const { store_url, access_token, limit = 50 } = body;
        try {
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          const response = await fetch(`https://${fullStoreUrl}/admin/api/2024-01/products.json?limit=${limit}`, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return res.status(200).json({ success: true, products: data.products });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'shopify_getOrders') {
        const { store_url, access_token, customer_email } = body;
        try {
          console.log('🔍 Shopify getOrders called:', { store_url, customer_email });
          
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          let url = `https://${fullStoreUrl}/admin/api/2024-01/orders.json?status=any&limit=250`;
          if (customer_email) {
            url += `&email=${encodeURIComponent(customer_email)}`;
          }
          
          console.log('📡 Full Shopify URL:', url);
          
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          
          console.log('✅ Shopify response status:', response.status);
          console.log('📦 Orders found:', data.orders?.length || 0);
          
          if (data.orders && data.orders.length > 0) {
            console.log('📧 First order email:', data.orders[0].email);
            console.log('🔢 First order name:', data.orders[0].name);
          }
          
          return res.status(200).json({ success: true, orders: data.orders || [] });
        } catch (error) {
          console.error('❌ Error fetching orders:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'shopify_searchOrders') {
        const { store_url, access_token, order_name } = body;
        try {
          console.log('🔍 Searching orders for:', order_name);
          
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          // Search by order name/number
          // Shopify's "name" parameter searches by order name (e.g., #1001, #1002)
          const url = `https://${fullStoreUrl}/admin/api/2024-01/orders.json?name=${encodeURIComponent(order_name)}&status=any`;
          
          console.log('📡 Search URL:', url);
          
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('❌ Shopify order search error:', response.status, data);
            return res.status(response.status).json({ 
              success: false, 
              error: data.errors || data.error || 'Failed to search orders',
              details: data
            });
          }
          
          console.log('✅ Found', data.orders?.length || 0, 'matching orders');
          return res.status(200).json({ 
            success: true, 
            orders: data.orders || [] 
          });
        } catch (error) {
          console.error('❌ Order search error:', error);
          return res.status(500).json({ 
            success: false, 
            error: error.message 
          });
        }
      }

      if (action === 'shopify_getDraftOrders') {
        const { store_url, access_token, customer_email } = body;
        try {
          console.log('🛒 Getting draft orders for:', customer_email);
          
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          // Get all draft orders and filter by customer email if provided
          let url = `https://${fullStoreUrl}/admin/api/2024-01/draft_orders.json`;
          
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('❌ Shopify API error:', response.status, data);
            return res.status(response.status).json({ 
              success: false, 
              error: data.errors || data.error || 'Failed to get draft orders',
              details: data
            });
          }
          
          let draft_orders = data.draft_orders || [];
          
          // Filter by customer email if provided
          if (customer_email) {
            draft_orders = draft_orders.filter(order => 
              order.email === customer_email || 
              order.customer?.email === customer_email
            );
          }
          
          console.log('✅ Found', draft_orders.length, 'draft orders');
          return res.status(200).json({ success: true, draft_orders });
        } catch (error) {
          console.error('❌ Draft orders fetch error:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'shopify_createDraftOrder') {
        const { store_url, access_token, draft_order } = body;
        try {
          console.log('🛒 Creating draft order for store:', store_url);
          console.log('📝 Draft order data:', JSON.stringify(draft_order, null, 2));
          
          // Ensure store URL has .myshopify.com
          const fullStoreUrl = store_url.includes('.myshopify.com') ? store_url : `${store_url}.myshopify.com`;
          
          const response = await fetch(`https://${fullStoreUrl}/admin/api/2024-01/draft_orders.json`, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(draft_order)
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('❌ Shopify API error:', response.status, data);
            return res.status(response.status).json({ 
              success: false, 
              error: data.errors || data.error || 'Failed to create draft order',
              details: data
            });
          }
          
          console.log('✅ Draft order created:', data.draft_order?.id);
          return res.status(200).json({ success: true, draft_order: data.draft_order });
        } catch (error) {
          console.error('❌ Draft order creation error:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      // ==================== KLAVIYO INTEGRATION ====================
      if (action === 'klaviyo_getLists') {
        const { api_key } = body;
        try {
          const response = await fetch('https://a.klaviyo.com/api/lists/', {
            headers: {
              'Authorization': `Klaviyo-API-Key ${api_key}`,
              'Content-Type': 'application/json',
              'revision': '2024-10-15'
            }
          });
          const data = await response.json();
          return res.status(200).json({ success: true, lists: data.data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'klaviyo_subscribeProfile') {
        const { api_key, list_id, email, first_name, last_name } = body;
        try {
          const subscription = {
            data: {
              type: 'profile-subscription-bulk-create-job',
              attributes: {
                profiles: {
                  data: [{
                    type: 'profile',
                    attributes: {
                      email: email,
                      first_name: first_name,
                      last_name: last_name,
                      subscriptions: {
                        email: { marketing: { consent: 'SUBSCRIBED' } }
                      }
                    }
                  }]
                }
              },
              relationships: {
                list: { data: { type: 'list', id: list_id } }
              }
            }
          };

          const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
            method: 'POST',
            headers: {
              'Authorization': `Klaviyo-API-Key ${api_key}`,
              'Content-Type': 'application/json',
              'revision': '2024-10-15'
            },
            body: JSON.stringify(subscription)
          });
          const data = await response.json();
          return res.status(200).json({ success: true, data: data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'klaviyo_trackEvent') {
        const { api_key, email, event_name, properties } = body;
        try {
          const event = {
            data: {
              type: 'event',
              attributes: {
                properties: properties || {},
                metric: {
                  data: {
                    type: 'metric',
                    attributes: { name: event_name }
                  }
                },
                profile: {
                  data: {
                    type: 'profile',
                    attributes: { email: email }
                  }
                }
              }
            }
          };

          const response = await fetch('https://a.klaviyo.com/api/events/', {
            method: 'POST',
            headers: {
              'Authorization': `Klaviyo-API-Key ${api_key}`,
              'Content-Type': 'application/json',
              'revision': '2024-10-15'
            },
            body: JSON.stringify(event)
          });
          const data = await response.json();
          return res.status(200).json({ success: true, data: data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      // ==================== KUSTOMER INTEGRATION ====================
      if (action === 'kustomer_getCustomer') {
        const { api_key, subdomain, email } = body;
        try {
          const response = await fetch(`https://${subdomain}.api.kustomerapp.com/v1/customers?email=${encodeURIComponent(email)}`, {
            headers: {
              'Authorization': `Bearer ${api_key}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return res.status(200).json({ success: true, data: data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'kustomer_createConversation') {
        const { api_key, subdomain, customer_id, message, subject } = body;
        try {
          const conversation = {
            data: {
              type: 'conversation',
              attributes: {
                title: subject || 'Chat Conversation',
                status: 'open',
                priority: 'normal'
              },
              relationships: {
                customer: {
                  data: { type: 'customer', id: customer_id }
                }
              }
            }
          };

          const response = await fetch(`https://${subdomain}.api.kustomerapp.com/v1/conversations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${api_key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(conversation)
          });
          const data = await response.json();
          
          // Add initial message if provided
          if (message && data.data?.id) {
            await fetch(`https://${subdomain}.api.kustomerapp.com/v1/conversations/${data.data.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                data: {
                  type: 'message',
                  attributes: {
                    body: message,
                    direction: 'in'
                  }
                }
              })
            });
          }
          
          return res.status(200).json({ success: true, data: data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      // ==================== MESSENGER INTEGRATION ====================
      if (action === 'messenger_sendMessage') {
        const { page_access_token, recipient_id, message_text } = body;
        try {
          const response = await fetch('https://graph.facebook.com/v18.0/me/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient: { id: recipient_id },
              message: { text: message_text },
              access_token: page_access_token
            })
          });
          const data = await response.json();
          return res.status(200).json({ success: true, data: data });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      if (action === 'messenger_webhook') {
        // Handle webhook verification
        if (method === 'GET') {
          const mode = query['hub.mode'];
          const token = query['hub.verify_token'];
          const challenge = query['hub.challenge'];
          
          if (mode === 'subscribe' && token === process.env.MESSENGER_VERIFY_TOKEN) {
            return res.status(200).send(challenge);
          }
          return res.status(403).json({ error: 'Verification failed' });
        }
        
        // Handle incoming messages
        if (method === 'POST') {
          const { entry } = body;
          if (entry && entry[0]?.messaging) {
            // Process messages here
            return res.status(200).json({ success: true });
          }
          return res.status(400).json({ error: 'Invalid webhook data' });
        }
      }

      return res.status(400).json({ error: 'Invalid action or endpoint' });
    }

    // ============================================================
    // OPENAI PROXY
    // ============================================================
    if (endpoint === 'openai') {
      if (action === 'chat') {
        const { messages, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 500 } = body;
        
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
          }

          const data = await response.json();
          return res.status(200).json({ success: true, data });
        } catch (error) {
          console.error('OpenAI API error:', error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }
      
      return res.status(400).json({ error: 'Invalid OpenAI action' });
    }

    // ============================================================
    // AUTHENTICATION OPERATIONS
    // ============================================================
    if (endpoint === 'auth') {
      // Note: In production, use bcrypt for password hashing
      // For now using simple comparison (add bcryptjs package for production)
      
      // ==================== LOGIN ====================
      if (action === 'login') {
        const { email, password } = body;
        
        try {
          // First, check if agents table has required columns
          try {
            await sql`SELECT password_hash FROM agents LIMIT 1`;
          } catch (error) {
            // If password_hash column doesn't exist, add it
            console.log('Adding authentication columns to agents table...');
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS password_hash TEXT`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token TEXT`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE`;
          }
          
          // Check if sessions table exists
          try {
            await sql`SELECT 1 FROM sessions LIMIT 1`;
          } catch (error) {
            // Create sessions table
            console.log('Creating sessions table...');
            await sql`
              CREATE TABLE IF NOT EXISTS sessions (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `;
            await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id)`;
          }
          
          // Check if user exists
          let users = await sql`
            SELECT * FROM agents 
            WHERE email = ${email}
          `;
          
          // Auto-create demo users if they don't exist
          if (users.length === 0) {
            // Only auto-create admin account
            if (email === 'admin@chatbot.com' && password === 'admin123') {
              console.log('Creating admin user...');
              const result = await sql`
                INSERT INTO agents (organization_id, email, name, role, password_hash, is_active)
                VALUES ('00000000-0000-0000-0000-000000000001', 'admin@chatbot.com', 'Admin User', 'admin', 'admin123', true)
                RETURNING *
              `;
              users = result;
            } else {
              // All other users must sign up first
              return res.status(401).json({ success: false, error: 'Invalid email or password. Please sign up first.' });
            }
          }
          
          const user = users[0];
          
          // Check if active
          if (!user.is_active) {
            return res.status(401).json({ success: false, error: 'Account is disabled' });
          }
          
          // Check if account is locked
          if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(401).json({ 
              success: false, 
              error: 'Account is temporarily locked. Please try again later.' 
            });
          }
          
          // Simple password check (in production, use bcrypt.compare)
          // For admin: always check against admin123
          // For other users: check password_hash from database
          const isValidPassword = 
            (email === 'admin@chatbot.com' && password === 'admin123') ||
            (email !== 'admin@chatbot.com' && user.password_hash === password); // Custom users
          
          if (!isValidPassword) {
            // Increment login attempts
            const attempts = (user.login_attempts || 0) + 1;
            const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            
            await sql`
              UPDATE agents 
              SET login_attempts = ${attempts}, locked_until = ${lockUntil}
              WHERE id = ${user.id}
            `;
            
            return res.status(401).json({ 
              success: false, 
              error: `Invalid email or password${attempts >= 3 ? `. ${5 - attempts} attempts remaining.` : ''}` 
            });
          }
          
          // Reset login attempts on successful login
          await sql`
            UPDATE agents 
            SET login_attempts = 0, locked_until = NULL, last_login = NOW()
            WHERE id = ${user.id}
          `;
          
          // Create session token
          const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          
          await sql`
            INSERT INTO sessions (agent_id, token, expires_at, ip_address, user_agent)
            VALUES (${user.id}, ${token}, ${expiresAt}, ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'}, ${req.headers['user-agent'] || 'unknown'})
          `;
          
          return res.status(200).json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              organization_id: user.organization_id
            },
            token,
            expiresAt: expiresAt.toISOString()
          });
        } catch (error) {
          console.error('Login error:', error);
          return res.status(500).json({ success: false, error: 'Login failed: ' + error.message });
        }
      }
      
      // ==================== LOGOUT ====================
      if (action === 'logout') {
        const { token } = body;
        
        if (token) {
          await sql`DELETE FROM sessions WHERE token = ${token}`;
        }
        
        return res.status(200).json({ success: true });
      }
      
      // ==================== SIGNUP ====================
      if (action === 'signup') {
        const { email, password, name } = body;
        
        try {
          // Ensure auth columns exist first
          try {
            await sql`SELECT password_hash FROM agents LIMIT 1`;
          } catch (error) {
            console.log('Adding authentication columns for signup...');
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS password_hash TEXT`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token TEXT`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0`;
            await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE`;
          }
          
          // Ensure sessions table exists
          try {
            await sql`SELECT 1 FROM sessions LIMIT 1`;
          } catch (error) {
            console.log('Creating sessions table for signup...');
            await sql`
              CREATE TABLE IF NOT EXISTS sessions (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `;
            await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id)`;
          }
          
          // Validate input
          if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
          }
          
          if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
          }
          
          // Check if user already exists
          const existing = await sql`
            SELECT * FROM agents WHERE email = ${email}
          `;
          
          if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already registered. Please login.' });
          }
          
          // Create new user with 'agent' role by default
          const result = await sql`
            INSERT INTO agents (organization_id, email, name, role, password_hash, is_active)
            VALUES ('00000000-0000-0000-0000-000000000001', ${email}, ${name}, 'agent', ${password}, true)
            RETURNING id, email, name, role, organization_id
          `;
          
          const newUser = result[0];
          
          // Auto-login after signup
          const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          
          await sql`
            INSERT INTO sessions (agent_id, token, expires_at, ip_address, user_agent)
            VALUES (${newUser.id}, ${token}, ${expiresAt}, ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'}, ${req.headers['user-agent'] || 'unknown'})
          `;
          
          return res.status(201).json({
            success: true,
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              organization_id: newUser.organization_id
            },
            token,
            expiresAt: expiresAt.toISOString(),
            message: 'Account created successfully'
          });
        } catch (error) {
          console.error('Signup error:', error);
          return res.status(500).json({ success: false, error: 'Signup failed: ' + error.message });
        }
      }
      
      // ==================== LIST USERS ====================
      if (action === 'list_users') {
        const { token, organizationId } = body;
        
        // Verify token and check if admin
        const sessions = await sql`
          SELECT a.* FROM sessions s
          JOIN agents a ON s.agent_id = a.id
          WHERE s.token = ${token} AND s.expires_at > NOW()
        `;
        
        if (sessions.length === 0 || sessions[0].role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        const users = await sql`
          SELECT id, email, name, role, is_active, last_login, created_at
          FROM agents
          WHERE organization_id = ${organizationId}
          ORDER BY created_at DESC
        `;
        
        return res.status(200).json({ success: true, users });
      }
      
      // ==================== CREATE USER ====================
      if (action === 'create_user') {
        const { token, organizationId, email, name, role, password } = body;
        
        // Verify admin
        const sessions = await sql`
          SELECT a.* FROM sessions s
          JOIN agents a ON s.agent_id = a.id
          WHERE s.token = ${token} AND s.expires_at > NOW()
        `;
        
        if (sessions.length === 0 || sessions[0].role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        try {
          // In production, hash password with bcrypt
          const result = await sql`
            INSERT INTO agents (organization_id, email, name, role, password_hash, is_active)
            VALUES (${organizationId}, ${email}, ${name}, ${role}, ${password}, true)
            RETURNING id, email, name, role, is_active, created_at
          `;
          
          return res.status(201).json({ success: true, user: result[0] });
        } catch (error) {
          if (error.message.includes('duplicate')) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
          }
          throw error;
        }
      }
      
      // ==================== UPDATE USER ====================
      if (action === 'update_user') {
        const { token, userId, name, role, password } = body;
        
        // Verify admin
        const sessions = await sql`
          SELECT a.* FROM sessions s
          JOIN agents a ON s.agent_id = a.id
          WHERE s.token = ${token} AND s.expires_at > NOW()
        `;
        
        if (sessions.length === 0 || sessions[0].role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        if (password) {
          // Update with password
          const result = await sql`
            UPDATE agents
            SET name = ${name}, role = ${role}, password_hash = ${password}, updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, email, name, role, is_active
          `;
          return res.status(200).json({ success: true, user: result[0] });
        } else {
          // Update without password
          const result = await sql`
            UPDATE agents
            SET name = ${name}, role = ${role}, updated_at = NOW()
            WHERE id = ${userId}
            RETURNING id, email, name, role, is_active
          `;
          return res.status(200).json({ success: true, user: result[0] });
        }
      }
      
      // ==================== DELETE USER ====================
      if (action === 'delete_user') {
        const { token, userId } = body;
        
        // Verify admin
        const sessions = await sql`
          SELECT a.* FROM sessions s
          JOIN agents a ON s.agent_id = a.id
          WHERE s.token = ${token} AND s.expires_at > NOW()
        `;
        
        if (sessions.length === 0 || sessions[0].role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        await sql`DELETE FROM agents WHERE id = ${userId}`;
        return res.status(200).json({ success: true });
      }
      
      // ==================== TOGGLE USER ACTIVE ====================
      if (action === 'toggle_user_active') {
        const { token, userId, isActive } = body;
        
        // Verify admin
        const sessions = await sql`
          SELECT a.* FROM sessions s
          JOIN agents a ON s.agent_id = a.id
          WHERE s.token = ${token} AND s.expires_at > NOW()
        `;
        
        if (sessions.length === 0 || sessions[0].role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        await sql`
          UPDATE agents
          SET is_active = ${isActive}, updated_at = NOW()
          WHERE id = ${userId}
        `;
        
        return res.status(200).json({ success: true });
      }
      
      return res.status(400).json({ error: 'Invalid auth action' });
    }

    // ============================================================
    // PRIVACY & COMPLIANCE OPERATIONS
    // ============================================================
    if (endpoint === 'privacy') {
      // Record consent
      if (action === 'recordConsent') {
        const { customerId, organizationId, consentType, consented, consentVersion, ipAddress, userAgent } = body;
        
        const result = await sql`
          INSERT INTO customer_consent 
            (customer_id, organization_id, consent_type, consent_given, consent_version, consented_at, ip_address, user_agent)
          VALUES 
            (${customerId}, ${organizationId}, ${consentType}, ${consented}, ${consentVersion}, ${consented ? 'NOW()' : null}, ${ipAddress}, ${userAgent})
          ON CONFLICT (customer_id, consent_type)
          DO UPDATE SET
            consent_given = ${consented},
            consented_at = ${consented ? sql`NOW()` : null},
            withdrawn_at = ${!consented ? sql`NOW()` : null},
            updated_at = NOW()
          RETURNING *
        `;
        
        return res.status(200).json({ success: true, consent: result[0] });
      }
      
      // Check consent
      if (action === 'checkConsent') {
        const { customerEmail, organizationId, consentType } = body;
        
        const result = await sql`
          SELECT cc.consent_given
          FROM customer_consent cc
          JOIN customers c ON cc.customer_id = c.id
          WHERE c.email = ${customerEmail}
          AND c.organization_id = ${organizationId}
          AND cc.consent_type = ${consentType}
          AND cc.withdrawn_at IS NULL
        `;
        
        return res.status(200).json({ 
          success: true, 
          hasConsent: result.length > 0 && result[0].consent_given 
        });
      }
      
      // Request data deletion
      if (action === 'requestDeletion') {
        const { customerEmail, organizationId, requestType } = body;
        
        // Get customer ID
        const customers = await sql`
          SELECT id FROM customers 
          WHERE email = ${customerEmail} AND organization_id = ${organizationId}
        `;
        
        if (customers.length === 0) {
          return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        
        const customerId = customers[0].id;
        
        // Create deletion request
        const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        const result = await sql`
          INSERT INTO data_deletion_requests
            (organization_id, customer_id, customer_email, request_type, verification_token, verification_expires_at)
          VALUES
            (${organizationId}, ${customerId}, ${customerEmail}, ${requestType}, ${verificationToken}, ${expiresAt})
          RETURNING *
        `;
        
        // In production, send verification email here
        
        return res.status(200).json({ 
          success: true, 
          requestId: result[0].id,
          message: 'Deletion request created. Verification required.',
          verificationToken // In production, send via email only
        });
      }
      
      // Export customer data
      if (action === 'exportData') {
        const { customerEmail, organizationId } = body;
        
        try {
          const result = await sql`SELECT export_customer_data(${customerEmail})`;
          const exportedData = result[0].export_customer_data;
          
          // Log the export
          await sql`
            INSERT INTO data_access_log (organization_id, accessed_by, access_type, purpose)
            VALUES (${organizationId}, 'system', 'export', 'GDPR Data Portability Request')
          `;
          
          return res.status(200).json({ 
            success: true, 
            data: exportedData
          });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }
      
      // Log data access
      if (action === 'logAccess') {
        const { customerEmail, accessType, dataAccessed, purpose, accessedBy } = body;
        
        // Get customer and org IDs
        const customers = await sql`
          SELECT id, organization_id FROM customers WHERE email = ${customerEmail}
        `;
        
        if (customers.length > 0) {
          const customer = customers[0];
          
          await sql`
            INSERT INTO data_access_log
              (organization_id, customer_id, accessed_by, access_type, data_accessed, purpose)
            VALUES
              (${customer.organization_id}, ${customer.id}, ${accessedBy}, ${accessType}, ${dataAccessed}, ${purpose})
          `;
        }
        
        return res.status(200).json({ success: true });
      }
      
      // Anonymize customer (process deletion request)
      if (action === 'anonymizeCustomer') {
        const { customerEmail, organizationId } = body;
        
        const customers = await sql`
          SELECT id FROM customers 
          WHERE email = ${customerEmail} AND organization_id = ${organizationId}
        `;
        
        if (customers.length === 0) {
          return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        
        try {
          await sql`SELECT anonymize_customer_data(${customers[0].id})`;
          return res.status(200).json({ success: true, message: 'Customer data anonymized' });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
      }
      
      return res.status(400).json({ error: 'Invalid privacy action' });
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
