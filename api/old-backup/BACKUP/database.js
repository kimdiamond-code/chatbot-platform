import { neon } from '@neondatabase/serverless';

// Initialize Neon client (optimized for serverless)
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'testConnection':
        const result = await sql`SELECT NOW()`;
        return res.status(200).json({ success: true, time: result[0].now });

      case 'getOrganization':
        const org = await sql`SELECT * FROM organizations WHERE id = ${data.id}`;
        return res.status(200).json({ success: true, data: org[0] });

      case 'getBotConfigs':
        const configs = await sql`SELECT * FROM bot_configs WHERE organization_id = ${data.orgId}`;
        return res.status(200).json({ success: true, data: configs });

      case 'createConversation':
        const conversation = await sql`
          INSERT INTO conversations (organization_id, bot_config_id, customer_email, customer_name, customer_phone, channel, metadata)
          VALUES (${data.organization_id}, ${data.bot_config_id}, ${data.customer_email}, ${data.customer_name}, ${data.customer_phone}, ${data.channel}, ${JSON.stringify(data.metadata || {})})
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: conversation[0] });

      case 'getConversations':
        const conversations = await sql`
          SELECT * FROM conversations 
          WHERE organization_id = ${data.orgId}
          ORDER BY created_at DESC
          LIMIT ${data.limit || 50}
        `;
        return res.status(200).json({ success: true, data: conversations });

      case 'getMessages':
        const messages = await sql`
          SELECT * FROM messages 
          WHERE conversation_id = ${data.conversationId}
          ORDER BY created_at ASC
        `;
        return res.status(200).json({ success: true, data: messages });

      case 'createMessage':
        const message = await sql`
          INSERT INTO messages (conversation_id, sender_type, content, metadata)
          VALUES (${data.conversation_id}, ${data.sender_type}, ${data.content}, ${JSON.stringify(data.metadata || {})})
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: message[0] });

      case 'getIntegrations':
        const integrations = await sql`SELECT * FROM integrations WHERE organization_id = ${data.orgId}`;
        return res.status(200).json({ success: true, data: integrations });

      case 'upsertIntegration':
        const integration = await sql`
          INSERT INTO integrations (organization_id, integration_id, integration_name, status, config, credentials_encrypted, connected_at)
          VALUES (${data.organization_id}, ${data.integration_id}, ${data.integration_name}, ${data.status}, ${JSON.stringify(data.config || {})}, ${data.credentials_encrypted}, NOW())
          ON CONFLICT (organization_id, integration_id) 
          DO UPDATE SET status = ${data.status}, config = ${JSON.stringify(data.config || {})}, credentials_encrypted = ${data.credentials_encrypted}, connected_at = NOW()
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: integration[0] });

      case 'createAnalyticsEvent':
        const analyticsEvent = await sql`
          INSERT INTO analytics_events (organization_id, conversation_id, event_type, event_data)
          VALUES (${data.organization_id}, ${data.conversation_id}, ${data.event_type}, ${JSON.stringify(data.event_data || {})})
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: analyticsEvent[0] });

      case 'getAnalytics':
        const analytics = await sql`
          SELECT event_type, COUNT(*) as count, DATE_TRUNC('day', created_at) as date
          FROM analytics_events 
          WHERE organization_id = ${data.orgId} 
          AND created_at BETWEEN ${data.startDate} AND ${data.endDate}
          GROUP BY event_type, DATE_TRUNC('day', created_at)
          ORDER BY date DESC
        `;
        return res.status(200).json({ success: true, data: analytics });

      case 'upsertCustomer':
        const customer = await sql`
          INSERT INTO customers (organization_id, email, name, phone, metadata, tags)
          VALUES (${data.organization_id}, ${data.email}, ${data.name}, ${data.phone}, ${JSON.stringify(data.metadata || {})}, ${data.tags || []})
          ON CONFLICT (organization_id, email) 
          DO UPDATE SET name = ${data.name}, phone = ${data.phone}, metadata = ${JSON.stringify(data.metadata || {})}, tags = ${data.tags || []}, updated_at = NOW()
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: customer[0] });

      case 'saveBotConfig':
        // Save or update bot config (upsert)
        const existing = await sql`SELECT id FROM bot_configs WHERE organization_id = ${data.organization_id} AND is_active = true LIMIT 1`;
        
        if (existing.length > 0) {
          // Update existing
          const updated = await sql`
            UPDATE bot_configs 
            SET 
              name = ${data.name},
              personality = ${data.personality},
              instructions = ${data.instructions},
              greeting_message = ${data.greeting_message},
              fallback_message = ${data.fallback_message},
              settings = ${JSON.stringify(data.settings || {})},
              is_active = true,
              updated_at = NOW()
            WHERE id = ${existing[0].id}
            RETURNING *
          `;
          return res.status(200).json({ success: true, data: updated[0] });
        } else {
          // Insert new
          const inserted = await sql`
            INSERT INTO bot_configs (
              organization_id, name, personality, instructions, 
              greeting_message, fallback_message, settings, is_active
            )
            VALUES (
              ${data.organization_id}, ${data.name}, ${data.personality}, 
              ${data.instructions}, ${data.greeting_message}, 
              ${data.fallback_message}, ${JSON.stringify(data.settings || {})}, true
            )
            RETURNING *
          `;
          return res.status(200).json({ success: true, data: inserted[0] });
        }

      case 'loadBotConfig':
        const botConfig = await sql`
          SELECT * FROM bot_configs 
          WHERE organization_id = ${data.organization_id} AND is_active = true
          ORDER BY created_at DESC
          LIMIT 1
        `;
        return res.status(200).json({ success: true, data: botConfig[0] || null });

      case 'updateBotConfig':
        const updatedBot = await sql`
          UPDATE bot_configs 
          SET 
            name = ${data.name},
            personality = ${data.personality},
            instructions = ${data.instructions},
            greeting_message = ${data.greeting_message},
            fallback_message = ${data.fallback_message},
            settings = ${JSON.stringify(data.settings || {})},
            is_active = ${data.is_active !== undefined ? data.is_active : true},
            updated_at = NOW()
          WHERE id = ${data.id}
          RETURNING *
        `;
        return res.status(200).json({ success: true, data: updatedBot[0] });

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Database API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
