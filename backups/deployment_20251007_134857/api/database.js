// ===================================================================
// DATABASE API - Unified endpoint for all database operations
// ===================================================================

import { neon } from '@neondatabase/serverless';

// Initialize Neon database
const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({ ok: true });
  }

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { method, query, body } = req;

  try {
    // GET /api/database - Health check
    if (method === 'GET' && !query.endpoint) {
      const result = await sql`SELECT 1 as health`;
      return res.status(200).json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }

    // GET /api/database?endpoint=conversations
    if (method === 'GET' && query.endpoint === 'conversations') {
      const conversations = await sql`
        SELECT * FROM conversations 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      return res.status(200).json({ conversations });
    }

    // GET /api/database?endpoint=messages&conversation_id=xxx
    if (method === 'GET' && query.endpoint === 'messages') {
      const conversationId = query.conversation_id;
      
      if (!conversationId) {
        return res.status(400).json({ error: 'conversation_id required' });
      }

      const messages = await sql`
        SELECT * FROM messages 
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
      `;
      
      return res.status(200).json({ messages });
    }

    // POST /api/database - Create conversation, message, or handle other actions
    if (method === 'POST') {
      const { action, ...data } = body;

      // Proactive Triggers
      if (action === 'getProactiveTriggers') {
        const { orgId } = data;
        const triggers = await sql`
          SELECT * FROM proactive_triggers
          WHERE organization_id = ${orgId}
          ORDER BY priority DESC, created_at DESC
        `;
        return res.status(200).json({ success: true, data: triggers });
      }

      if (action === 'saveProactiveTrigger') {
        const { organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config } = data;
        const result = await sql`
          INSERT INTO proactive_triggers
            (organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config)
          VALUES
            (${organization_id}, ${name}, ${trigger_type}, ${message}, ${delay_seconds || 0}, ${priority || 5}, ${JSON.stringify(conditions || {})}, ${JSON.stringify(action_config || {})})
          RETURNING *
        `;
        return res.status(201).json({ success: true, data: result[0] });
      }

      if (action === 'updateProactiveTrigger') {
        const { triggerId, updates } = data;
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
        const { triggerId } = data;
        await sql`DELETE FROM proactive_triggers WHERE id = ${triggerId}`;
        return res.status(200).json({ success: true });
      }

      if (action === 'toggleProactiveTrigger') {
        const { triggerId, enabled } = data;
        const result = await sql`
          UPDATE proactive_triggers
          SET enabled = ${enabled}, updated_at = NOW()
          WHERE id = ${triggerId}
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: result[0] });
      }

      if (action === 'logProactiveTriggerEvent') {
        const { trigger_id, conversation_id, resulted_in_conversion, metadata } = data;
        const result = await sql`
          INSERT INTO proactive_trigger_stats
            (trigger_id, conversation_id, resulted_in_conversion, metadata)
          VALUES
            (${trigger_id}, ${conversation_id}, ${resulted_in_conversion || false}, ${JSON.stringify(metadata || {})})
          RETURNING *
        `;
        return res.status(201).json({ success: true, data: result[0] });
      }

      if (action === 'getProactiveTriggerStats') {
        const { orgId, startDate, endDate } = data;
        const stats = await sql`
          SELECT
            pt.id,
            pt.name,
            COUNT(pts.id) as total_triggers,
            SUM(CASE WHEN pts.resulted_in_conversion THEN 1 ELSE 0 END) as conversions,
            CASE
              WHEN COUNT(pts.id) > 0
              THEN (SUM(CASE WHEN pts.resulted_in_conversion THEN 1 ELSE 0 END)::float / COUNT(pts.id) * 100)
              ELSE 0
            END as conversion_rate
          FROM proactive_triggers pt
          LEFT JOIN proactive_trigger_stats pts ON pt.id = pts.trigger_id
            AND pts.triggered_at >= ${startDate}
            AND pts.triggered_at <= ${endDate}
          WHERE pt.organization_id = ${orgId}
          GROUP BY pt.id, pt.name
        `;
        return res.status(200).json({ success: true, data: stats });
      }

      // Create conversation
      if (action === 'create_conversation') {
        const { customer_email, customer_name, customer_phone, channel, status } = data;
        
        const result = await sql`
          INSERT INTO conversations 
            (customer_email, customer_name, customer_phone, channel, status)
          VALUES 
            (${customer_email}, ${customer_name}, ${customer_phone}, ${channel || 'web'}, ${status || 'active'})
          RETURNING *
        `;
        
        return res.status(201).json({ conversation: result[0] });
      }

      // Create message
      if (action === 'create_message') {
        const { conversation_id, sender_type, content, metadata } = data;
        
        const result = await sql`
          INSERT INTO messages 
            (conversation_id, sender_type, content, metadata)
          VALUES 
            (${conversation_id}, ${sender_type}, ${content}, ${metadata ? JSON.stringify(metadata) : '{}'})
          RETURNING *
        `;
        
        return res.status(201).json({ message: result[0] });
      }

      return res.status(400).json({ error: 'Invalid action. Use create_conversation or create_message' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Database API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
