import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon (required for serverless environments)
neonConfig.webSocketConstructor = ws;

// Create connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Generic query function
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close pool (for cleanup)
export async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

// Export pool for direct access if needed
export { pool };

// Helper functions for common operations
export const db = {
  // Organizations
  async getOrganization(id) {
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  async createOrganization(data) {
    const { name, subdomain, settings } = data;
    const result = await query(
      'INSERT INTO organizations (name, subdomain, settings) VALUES ($1, $2, $3) RETURNING *',
      [name, subdomain, JSON.stringify(settings || {})]
    );
    return result.rows[0];
  },

  // Bot Configs
  async getBotConfig(id) {
    const result = await query('SELECT * FROM bot_configs WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getBotConfigsByOrg(orgId) {
    const result = await query('SELECT * FROM bot_configs WHERE organization_id = $1', [orgId]);
    return result.rows;
  },

  async createBotConfig(data) {
    const { organization_id, name, personality, instructions, greeting_message, fallback_message, settings } = data;
    const result = await query(
      `INSERT INTO bot_configs (organization_id, name, personality, instructions, greeting_message, fallback_message, settings) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [organization_id, name, personality, instructions, greeting_message, fallback_message, JSON.stringify(settings || {})]
    );
    return result.rows[0];
  },

  async updateBotConfig(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE bot_configs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Conversations
  async getConversation(id) {
    const result = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getConversationsByOrg(orgId, limit = 50) {
    const result = await query(
      'SELECT * FROM conversations WHERE organization_id = $1 ORDER BY created_at DESC LIMIT $2',
      [orgId, limit]
    );
    return result.rows;
  },

  async createConversation(data) {
    const { organization_id, bot_config_id, customer_email, customer_name, customer_phone, channel, metadata } = data;
    const result = await query(
      `INSERT INTO conversations (organization_id, bot_config_id, customer_email, customer_name, customer_phone, channel, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [organization_id, bot_config_id, customer_email, customer_name, customer_phone, channel, JSON.stringify(metadata || {})]
    );
    return result.rows[0];
  },

  // Messages
  async getMessagesByConversation(conversationId) {
    const result = await query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    return result.rows;
  },

  async createMessage(data) {
    const { conversation_id, sender_type, content, metadata } = data;
    const result = await query(
      'INSERT INTO messages (conversation_id, sender_type, content, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [conversation_id, sender_type, content, JSON.stringify(metadata || {})]
    );
    return result.rows[0];
  },

  // Integrations
  async getIntegrationsByOrg(orgId) {
    const result = await query('SELECT * FROM integrations WHERE organization_id = $1', [orgId]);
    return result.rows;
  },

  async getIntegration(orgId, integrationId) {
    const result = await query(
      'SELECT * FROM integrations WHERE organization_id = $1 AND integration_id = $2',
      [orgId, integrationId]
    );
    return result.rows[0];
  },

  async upsertIntegration(data) {
    const { organization_id, integration_id, integration_name, status, config, credentials_encrypted } = data;
    const result = await query(
      `INSERT INTO integrations (organization_id, integration_id, integration_name, status, config, credentials_encrypted, connected_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (organization_id, integration_id) 
       DO UPDATE SET status = $4, config = $5, credentials_encrypted = $6, connected_at = NOW()
       RETURNING *`,
      [organization_id, integration_id, integration_name, status, JSON.stringify(config || {}), credentials_encrypted]
    );
    return result.rows[0];
  },

  // Analytics
  async createAnalyticsEvent(data) {
    const { organization_id, conversation_id, event_type, event_data } = data;
    const result = await query(
      'INSERT INTO analytics_events (organization_id, conversation_id, event_type, event_data) VALUES ($1, $2, $3, $4) RETURNING *',
      [organization_id, conversation_id, event_type, JSON.stringify(event_data || {})]
    );
    return result.rows[0];
  },

  async getAnalytics(orgId, startDate, endDate) {
    const result = await query(
      `SELECT event_type, COUNT(*) as count, DATE_TRUNC('day', created_at) as date
       FROM analytics_events 
       WHERE organization_id = $1 AND created_at BETWEEN $2 AND $3
       GROUP BY event_type, DATE_TRUNC('day', created_at)
       ORDER BY date DESC`,
      [orgId, startDate, endDate]
    );
    return result.rows;
  },

  // Customers
  async getCustomer(orgId, email) {
    const result = await query(
      'SELECT * FROM customers WHERE organization_id = $1 AND email = $2',
      [orgId, email]
    );
    return result.rows[0];
  },

  async upsertCustomer(data) {
    const { organization_id, email, name, phone, metadata, tags } = data;
    const result = await query(
      `INSERT INTO customers (organization_id, email, name, phone, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (organization_id, email) 
       DO UPDATE SET name = $3, phone = $4, metadata = $5, tags = $6, updated_at = NOW()
       RETURNING *`,
      [organization_id, email, name, phone, JSON.stringify(metadata || {}), tags]
    );
    return result.rows[0];
  },
};

export default db;
