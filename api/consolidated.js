// ===================================================================
// CONSOLIDATED API - Single endpoint for ALL operations
// This reduces serverless functions from ~20 to just 1
// ===================================================================

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);

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
    // HEALTH CHECK
    // ============================================================
    if (method === 'GET' && !endpoint) {
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
      if (method === 'GET' && query.type === 'conversations') {
        const conversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC LIMIT 50`;
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

      // ==================== MESSAGES ====================
      if (method === 'GET' && query.type === 'messages') {
        const conversationId = query.conversation_id;
        if (!conversationId) return res.status(400).json({ error: 'conversation_id required' });
        
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
          // Generate OAuth URL
          const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers';
          
          // Use configured redirect URI or construct from VERCEL_URL
          let redirectUri;
          if (process.env.SHOPIFY_REDIRECT_URI) {
            redirectUri = process.env.SHOPIFY_REDIRECT_URI;
          } else {
            const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';
            redirectUri = baseUrl; // OAuth params will be handled on main route
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
      if (action === 'shopify_getProducts') {
        const { store_url, access_token, limit = 50 } = body;
        try {
          const response = await fetch(`https://${store_url}/admin/api/2024-01/products.json?limit=${limit}`, {
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
          let url = `https://${store_url}/admin/api/2024-01/orders.json`;
          if (customer_email) {
            url += `?email=${encodeURIComponent(customer_email)}&status=any`;
          }
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return res.status(200).json({ success: true, orders: data.orders });
        } catch (error) {
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

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
