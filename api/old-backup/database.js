// ===================================================================
// SECURE DATABASE API - With comprehensive security measures
// ===================================================================

import { neon } from '@neondatabase/serverless';
import {
  validateConversation,
  validateMessage,
  validateProactiveTrigger,
  sanitizeObject
} from './security/validation.js';
import { checkRateLimit, isIPBlocked } from './security/rateLimit.js';
import { corsMiddleware, securityHeaders } from './security/auth.js';
import { 
  createAuditLog, 
  logDataAccess, 
  logSecurityEvent,
  ACTION_TYPES 
} from './security/auditLog.js';
import { encryptFields, decryptFields } from './security/encryption.js';

// Initialize Neon database
const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);

// Fields to encrypt
const SENSITIVE_FIELDS = ['customer_email', 'customer_phone', 'customer_name'];

export default async function handler(req, res) {
  try {
    // Add security headers
    securityHeaders(res);
    corsMiddleware(req, res);
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ ok: true });
    }

    // Check if IP is blocked
    if (isIPBlocked(req)) {
      await logSecurityEvent({
        action: ACTION_TYPES.IP_BLOCKED,
        req,
        details: { reason: 'IP address blocked' }
      });
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // Apply rate limiting
    const rateLimitResult = checkRateLimit(req, 'database');
    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        action: ACTION_TYPES.RATE_LIMIT_EXCEEDED,
        req,
        details: { endpoint: 'database' }
      });
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
    }

    const { method, query, body } = req;

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
      await logDataAccess({
        action: ACTION_TYPES.DATA_READ,
        resourceType: 'conversations',
        req
      });

      const conversations = await sql`
        SELECT * FROM conversations 
        ORDER BY created_at DESC 
        LIMIT 50
      `;

      // Decrypt sensitive fields
      const decrypted = conversations.map(conv => 
        decryptFields(conv, SENSITIVE_FIELDS)
      );

      return res.status(200).json({ conversations: decrypted });
    }

    // GET /api/database?endpoint=messages&conversation_id=xxx
    if (method === 'GET' && query.endpoint === 'messages') {
      const conversationId = query.conversation_id;
      
      if (!conversationId) {
        return res.status(400).json({ error: 'conversation_id required' });
      }

      await logDataAccess({
        action: ACTION_TYPES.DATA_READ,
        resourceType: 'messages',
        resourceId: conversationId,
        req
      });

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

      // Sanitize all input data
      const sanitizedData = sanitizeObject(data);

      // Get conversations
      if (action === 'get_conversations') {
        const { orgId, limit } = sanitizedData;
        
        await logDataAccess({
          action: ACTION_TYPES.DATA_READ,
          resourceType: 'conversations',
          organizationId: orgId,
          req
        });

        const conversations = await sql`
          SELECT * FROM conversations 
          ${orgId ? sql`WHERE organization_id = ${orgId}` : sql``}
          ORDER BY created_at DESC 
          LIMIT ${limit || 50}
        `;

        // Decrypt sensitive fields
        const decrypted = conversations.map(conv => 
          decryptFields(conv, SENSITIVE_FIELDS)
        );

        return res.status(200).json({ conversations: decrypted });
      }

      // Proactive Triggers
      if (action === 'getProactiveTriggers') {
        const { orgId } = sanitizedData;
        
        await logDataAccess({
          action: ACTION_TYPES.DATA_READ,
          resourceType: 'proactive_triggers',
          organizationId: orgId,
          req
        });

        const triggers = await sql`
          SELECT * FROM proactive_triggers
          WHERE organization_id = ${orgId}
          ORDER BY priority DESC, created_at DESC
        `;
        return res.status(200).json({ success: true, data: triggers });
      }

      if (action === 'saveProactiveTrigger') {
        // Validate input
        const validation = validateProactiveTrigger(sanitizedData);
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Validation failed', 
            errors: validation.errors 
          });
        }

        const { organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config } = validation.data;

        const result = await sql`
          INSERT INTO proactive_triggers
            (organization_id, name, trigger_type, message, delay_seconds, priority, conditions, action_config)
          VALUES
            (${organization_id}, ${name}, ${trigger_type}, ${message}, ${delay_seconds || 0}, ${priority || 5}, ${JSON.stringify(conditions || {})}, ${JSON.stringify(action_config || {})})
          RETURNING *
        `;

        await logDataAccess({
          action: ACTION_TYPES.DATA_CREATE,
          resourceType: 'proactive_trigger',
          resourceId: result[0].id,
          organizationId: organization_id,
          req,
          details: { name, trigger_type }
        });

        return res.status(201).json({ success: true, data: result[0] });
      }

      if (action === 'updateProactiveTrigger') {
        const { triggerId, updates } = sanitizedData;

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

        await logDataAccess({
          action: ACTION_TYPES.DATA_UPDATE,
          resourceType: 'proactive_trigger',
          resourceId: triggerId,
          req
        });

        return res.status(200).json({ success: true, data: result[0] });
      }

      if (action === 'deleteProactiveTrigger') {
        const { triggerId } = sanitizedData;

        await sql`DELETE FROM proactive_triggers WHERE id = ${triggerId}`;

        await logDataAccess({
          action: ACTION_TYPES.DATA_DELETE,
          resourceType: 'proactive_trigger',
          resourceId: triggerId,
          req
        });

        return res.status(200).json({ success: true });
      }

      if (action === 'toggleProactiveTrigger') {
        const { triggerId, enabled } = sanitizedData;

        const result = await sql`
          UPDATE proactive_triggers
          SET enabled = ${enabled}, updated_at = NOW()
          WHERE id = ${triggerId}
          RETURNING *
        `;

        await logDataAccess({
          action: ACTION_TYPES.DATA_UPDATE,
          resourceType: 'proactive_trigger',
          resourceId: triggerId,
          req,
          details: { enabled }
        });

        return res.status(200).json({ success: true, data: result[0] });
      }

      if (action === 'logProactiveTriggerEvent') {
        const { trigger_id, conversation_id, resulted_in_conversion, metadata } = sanitizedData;

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
        const { orgId, startDate, endDate } = sanitizedData;

        await logDataAccess({
          action: ACTION_TYPES.DATA_READ,
          resourceType: 'proactive_trigger_stats',
          organizationId: orgId,
          req
        });

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
        // Validate input
        const validation = validateConversation(sanitizedData);
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Validation failed', 
            errors: validation.errors 
          });
        }

        const { customer_email, customer_name, customer_phone, channel, status } = validation.data;

        // Encrypt sensitive fields
        const encrypted = encryptFields(
          { customer_email, customer_name, customer_phone },
          SENSITIVE_FIELDS
        );

        const result = await sql`
          INSERT INTO conversations 
            (customer_email, customer_name, customer_phone, channel, status)
          VALUES 
            (${encrypted.customer_email}, ${encrypted.customer_name}, ${encrypted.customer_phone}, ${channel}, ${status})
          RETURNING *
        `;

        await logDataAccess({
          action: ACTION_TYPES.DATA_CREATE,
          resourceType: 'conversation',
          resourceId: result[0].id,
          req,
          details: { channel }
        });

        // Decrypt for response
        const decrypted = decryptFields(result[0], SENSITIVE_FIELDS);
        return res.status(201).json({ conversation: decrypted });
      }

      // Create message
      if (action === 'create_message') {
        // Validate input
        const validation = validateMessage(sanitizedData);
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Validation failed', 
            errors: validation.errors 
          });
        }

        const { conversation_id, sender_type, content, metadata } = validation.data;

        const result = await sql`
          INSERT INTO messages 
            (conversation_id, sender_type, content, metadata)
          VALUES 
            (${conversation_id}, ${sender_type}, ${content}, ${JSON.stringify(metadata)})
          RETURNING *
        `;

        await logDataAccess({
          action: ACTION_TYPES.DATA_CREATE,
          resourceType: 'message',
          resourceId: result[0].id,
          req,
          details: { conversation_id, sender_type }
        });

        return res.status(201).json({ message: result[0] });
      }

      return res.status(400).json({ 
        error: 'Invalid action', 
        validActions: [
          'get_conversations',
          'create_conversation',
          'create_message',
          'getProactiveTriggers',
          'saveProactiveTrigger',
          'updateProactiveTrigger',
          'deleteProactiveTrigger',
          'toggleProactiveTrigger',
          'logProactiveTriggerEvent',
          'getProactiveTriggerStats'
        ]
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Database API Error:', error);

    // Log critical error
    await logSecurityEvent({
      action: 'api_error',
      req,
      details: { 
        error: error.message,
        stack: error.stack
      }
    });

    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
