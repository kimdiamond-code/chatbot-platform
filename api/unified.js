// Unified API Handler - All endpoints in one function
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Database helper
async function query(sql, params = []) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  const db = neon(DATABASE_URL);
  return await db(sql, params);
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { action } = req.query;

    // Route based on action parameter
    switch (action) {
      // ============ CHAT ============
      case 'chat':
        return await handleChat(req, res);

      // ============ BOT CONFIG ============
      case 'getBotConfigs':
        return await getBotConfigs(req, res);
      case 'saveBotConfig':
        return await saveBotConfig(req, res);

      // ============ CONVERSATIONS ============
      case 'getConversations':
        return await getConversations(req, res);
      case 'saveConversation':
        return await saveConversation(req, res);

      // ============ CUSTOMERS ============
      case 'getCustomers':
        return await getCustomers(req, res);
      case 'saveCustomer':
        return await saveCustomer(req, res);

      // ============ INTEGRATIONS ============
      case 'getIntegrations':
        return await getIntegrations(req, res);
      case 'upsertIntegration':
        return await upsertIntegration(req, res);

      // ============ SHOPIFY ============
      case 'shopifyProducts':
        return await getShopifyProducts(req, res);
      case 'shopifyOrders':
        return await getShopifyOrders(req, res);
      case 'shopifyCustomers':
        return await getShopifyCustomers(req, res);

      // ============ WEB SCRAPING ============
      case 'scrapeWebsite':
        return await scrapeWebsite(req, res);

      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============ CHAT HANDLER ============
async function handleChat(req, res) {
  const { message, conversationId, botConfig } = req.body;

  // Simple response for now
  const response = {
    message: `Echo: ${message}`,
    conversationId: conversationId || Date.now().toString(),
  };

  return res.status(200).json(response);
}

// ============ BOT CONFIG HANDLERS ============
async function getBotConfigs(req, res) {
  const { organizationId } = req.query;
  
  const configs = await query(
    'SELECT * FROM bot_configs WHERE organization_id = $1',
    [organizationId]
  );

  return res.status(200).json(configs);
}

async function saveBotConfig(req, res) {
  const config = req.body;
  
  const result = await query(
    `INSERT INTO bot_configs (
      organization_id, name, personality, instructions, 
      greeting_message, fallback_message, settings
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (organization_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      personality = EXCLUDED.personality,
      instructions = EXCLUDED.instructions,
      greeting_message = EXCLUDED.greeting_message,
      fallback_message = EXCLUDED.fallback_message,
      settings = EXCLUDED.settings,
      updated_at = NOW()
    RETURNING *`,
    [
      config.organization_id,
      config.name,
      config.personality,
      config.instructions,
      config.greeting_message,
      config.fallback_message,
      config.settings
    ]
  );

  return res.status(200).json(result[0]);
}

// ============ CONVERSATION HANDLERS ============
async function getConversations(req, res) {
  const { organizationId } = req.query;
  
  const conversations = await query(
    'SELECT * FROM conversations WHERE organization_id = $1 ORDER BY updated_at DESC',
    [organizationId]
  );

  return res.status(200).json(conversations);
}

async function saveConversation(req, res) {
  const conv = req.body;
  
  const result = await query(
    `INSERT INTO conversations (
      id, organization_id, customer_id, messages, status, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) 
    DO UPDATE SET
      messages = EXCLUDED.messages,
      status = EXCLUDED.status,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *`,
    [
      conv.id,
      conv.organization_id,
      conv.customer_id,
      JSON.stringify(conv.messages),
      conv.status,
      JSON.stringify(conv.metadata)
    ]
  );

  return res.status(200).json(result[0]);
}

// ============ CUSTOMER HANDLERS ============
async function getCustomers(req, res) {
  const { organizationId } = req.query;
  
  const customers = await query(
    'SELECT * FROM customers WHERE organization_id = $1 ORDER BY created_at DESC',
    [organizationId]
  );

  return res.status(200).json(customers);
}

async function saveCustomer(req, res) {
  const customer = req.body;
  
  const result = await query(
    `INSERT INTO customers (
      id, organization_id, name, email, phone, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *`,
    [
      customer.id,
      customer.organization_id,
      customer.name,
      customer.email,
      customer.phone,
      JSON.stringify(customer.metadata)
    ]
  );

  return res.status(200).json(result[0]);
}

// ============ INTEGRATION HANDLERS ============
async function getIntegrations(req, res) {
  const { organizationId } = req.query;
  
  const integrations = await query(
    'SELECT * FROM integrations WHERE organization_id = $1',
    [organizationId]
  );

  return res.status(200).json(integrations);
}

async function upsertIntegration(req, res) {
  const integration = req.body;
  
  const result = await query(
    `INSERT INTO integrations (
      organization_id, integration_id, integration_name, 
      status, config, credentials_encrypted, connected_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (organization_id, integration_id) 
    DO UPDATE SET
      status = EXCLUDED.status,
      config = EXCLUDED.config,
      credentials_encrypted = EXCLUDED.credentials_encrypted,
      connected_at = EXCLUDED.connected_at,
      updated_at = NOW()
    RETURNING *`,
    [
      integration.organization_id,
      integration.integration_id,
      integration.integration_name,
      integration.status,
      JSON.stringify(integration.config),
      integration.credentials_encrypted,
      integration.connected_at
    ]
  );

  return res.status(200).json(result[0]);
}

// ============ SHOPIFY HANDLERS ============
async function getShopifyProducts(req, res) {
  // Get Shopify config from integrations
  const { organizationId } = req.query;
  
  const integrations = await query(
    'SELECT * FROM integrations WHERE organization_id = $1 AND integration_id = $2',
    [organizationId, 'shopify']
  );

  if (integrations.length === 0 || integrations[0].status !== 'connected') {
    return res.status(200).json([]);
  }

  const config = JSON.parse(integrations[0].config || '{}');
  const { shop, accessToken } = config;

  if (!shop || !accessToken) {
    return res.status(200).json([]);
  }

  // Fetch products from Shopify
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const data = await response.json();
    return res.status(200).json(data.products || []);
  } catch (error) {
    console.error('Shopify API error:', error);
    return res.status(200).json([]);
  }
}

async function getShopifyOrders(req, res) {
  const { organizationId } = req.query;
  
  const integrations = await query(
    'SELECT * FROM integrations WHERE organization_id = $1 AND integration_id = $2',
    [organizationId, 'shopify']
  );

  if (integrations.length === 0 || integrations[0].status !== 'connected') {
    return res.status(200).json([]);
  }

  const config = JSON.parse(integrations[0].config || '{}');
  const { shop, accessToken } = config;

  if (!shop || !accessToken) {
    return res.status(200).json([]);
  }

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const data = await response.json();
    return res.status(200).json(data.orders || []);
  } catch (error) {
    console.error('Shopify API error:', error);
    return res.status(200).json([]);
  }
}

async function getShopifyCustomers(req, res) {
  const { organizationId } = req.query;
  
  const integrations = await query(
    'SELECT * FROM integrations WHERE organization_id = $1 AND integration_id = $2',
    [organizationId, 'shopify']
  );

  if (integrations.length === 0 || integrations[0].status !== 'connected') {
    return res.status(200).json([]);
  }

  const config = JSON.parse(integrations[0].config || '{}');
  const { shop, accessToken } = config;

  if (!shop || !accessToken) {
    return res.status(200).json([]);
  }

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/customers.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const data = await response.json();
    return res.status(200).json(data.customers || []);
  } catch (error) {
    console.error('Shopify API error:', error);
    return res.status(200).json([]);
  }
}

// ============ WEB SCRAPING HANDLER ============
async function scrapeWebsite(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic text extraction (could be enhanced with cheerio)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return res.status(200).json({ 
      success: true, 
      url,
      content: text.substring(0, 5000) // Limit to 5000 chars
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
