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
