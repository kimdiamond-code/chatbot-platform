/**
 * UNIFIED INTEGRATIONS API HANDLER
 * Consolidates Kustomer, Klaviyo, Messenger, and other integrations
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, integration } = req.body || req.query;

    // ============== KUSTOMER ==============
    if (integration === 'kustomer') {
      if (action === 'connect') return await connectKustomer(req, res);
      if (action === 'test') return await testKustomer(req, res);
      if (action === 'sync') return await syncKustomer(req, res);
      if (action === 'disconnect') return await disconnectIntegration(req, res, 'kustomer');
    }

    // ============== KLAVIYO ==============
    if (integration === 'klaviyo') {
      if (action === 'connect') return await connectKlaviyo(req, res);
      if (action === 'test') return await testKlaviyo(req, res);
      if (action === 'sendEmail') return await sendKlaviyoEmail(req, res);
      if (action === 'disconnect') return await disconnectIntegration(req, res, 'klaviyo');
    }

    // ============== MESSENGER ==============
    if (integration === 'messenger') {
      if (action === 'connect') return await connectMessenger(req, res);
      if (action === 'webhook') return await handleMessengerWebhook(req, res);
      if (action === 'send') return await sendMessengerMessage(req, res);
      if (action === 'disconnect') return await disconnectIntegration(req, res, 'messenger');
    }

    // ============== GENERAL INTEGRATION ACTIONS ==============
    if (action === 'list') {
      return await listIntegrations(req, res);
    }

    if (action === 'status') {
      return await getIntegrationStatus(req, res);
    }

    return res.status(400).json({ error: 'Invalid action or integration' });

  } catch (error) {
    console.error('Integrations API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============== KUSTOMER FUNCTIONS ==============

async function connectKustomer(req, res) {
  const { organizationId, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  // Test connection
  const testResponse = await fetch('https://api.kustomerapp.com/v1/customers', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!testResponse.ok) {
    return res.status(400).json({ error: 'Invalid Kustomer API key' });
  }

  // Save to database
  await sql`
    INSERT INTO integrations (organization_id, integration_id, integration_name, status, credentials_encrypted, connected_at)
    VALUES (${organizationId}, 'kustomer', 'Kustomer', 'active', ${apiKey}, NOW())
    ON CONFLICT (organization_id, integration_id)
    DO UPDATE SET credentials_encrypted = ${apiKey}, status = 'active', connected_at = NOW()
  `;

  return res.status(200).json({ success: true, message: 'Kustomer connected' });
}

async function testKustomer(req, res) {
  const { organizationId } = req.body;

  const integration = await sql`
    SELECT credentials_encrypted FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = 'kustomer' AND status = 'active'
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ error: 'Kustomer not connected' });
  }

  const apiKey = integration[0].credentials_encrypted;

  const response = await fetch('https://api.kustomerapp.com/v1/customers?page=1&pageSize=1', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    return res.status(400).json({ success: false, error: 'Connection failed' });
  }

  return res.status(200).json({ success: true, message: 'Kustomer connection active' });
}

async function syncKustomer(req, res) {
  const { organizationId, customerId } = req.body;

  const integration = await sql`
    SELECT credentials_encrypted FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = 'kustomer' AND status = 'active'
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ error: 'Kustomer not connected' });
  }

  const apiKey = integration[0].credentials_encrypted;

  // Fetch customer data from Kustomer
  const response = await fetch(`https://api.kustomerapp.com/v1/customers/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    return res.status(400).json({ error: 'Failed to sync customer data' });
  }

  const customerData = await response.json();

  return res.status(200).json({ success: true, customer: customerData });
}

// ============== KLAVIYO FUNCTIONS ==============

async function connectKlaviyo(req, res) {
  const { organizationId, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  // Test connection
  const testResponse = await fetch('https://a.klaviyo.com/api/accounts/', {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15'
    }
  });

  if (!testResponse.ok) {
    return res.status(400).json({ error: 'Invalid Klaviyo API key' });
  }

  // Save to database
  await sql`
    INSERT INTO integrations (organization_id, integration_id, integration_name, status, credentials_encrypted, connected_at)
    VALUES (${organizationId}, 'klaviyo', 'Klaviyo', 'active', ${apiKey}, NOW())
    ON CONFLICT (organization_id, integration_id)
    DO UPDATE SET credentials_encrypted = ${apiKey}, status = 'active', connected_at = NOW()
  `;

  return res.status(200).json({ success: true, message: 'Klaviyo connected' });
}

async function testKlaviyo(req, res) {
  const { organizationId } = req.body;

  const integration = await sql`
    SELECT credentials_encrypted FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = 'klaviyo' AND status = 'active'
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ error: 'Klaviyo not connected' });
  }

  const apiKey = integration[0].credentials_encrypted;

  const response = await fetch('https://a.klaviyo.com/api/accounts/', {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': '2024-10-15'
    }
  });

  if (!response.ok) {
    return res.status(400).json({ success: false, error: 'Connection failed' });
  }

  return res.status(200).json({ success: true, message: 'Klaviyo connection active' });
}

async function sendKlaviyoEmail(req, res) {
  const { organizationId, email, templateId, data } = req.body;

  const integration = await sql`
    SELECT credentials_encrypted FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = 'klaviyo' AND status = 'active'
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ error: 'Klaviyo not connected' });
  }

  const apiKey = integration[0].credentials_encrypted;

  // Send email via Klaviyo API
  const response = await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      'revision': '2024-10-15'
    },
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          profile: { email },
          metric: { name: 'ChatBot Email' },
          properties: data
        }
      }
    })
  });

  if (!response.ok) {
    return res.status(400).json({ error: 'Failed to send email' });
  }

  return res.status(200).json({ success: true, message: 'Email sent' });
}

// ============== MESSENGER FUNCTIONS ==============

async function connectMessenger(req, res) {
  const { organizationId, pageAccessToken, verifyToken } = req.body;

  if (!pageAccessToken || !verifyToken) {
    return res.status(400).json({ error: 'Access token and verify token required' });
  }

  // Save to database
  await sql`
    INSERT INTO integrations (organization_id, integration_id, integration_name, status, credentials_encrypted, config, connected_at)
    VALUES (${organizationId}, 'messenger', 'Facebook Messenger', 'active', ${pageAccessToken}, ${JSON.stringify({ verifyToken })}, NOW())
    ON CONFLICT (organization_id, integration_id)
    DO UPDATE SET credentials_encrypted = ${pageAccessToken}, config = ${JSON.stringify({ verifyToken })}, status = 'active', connected_at = NOW()
  `;

  return res.status(200).json({ success: true, message: 'Messenger connected' });
}

async function handleMessengerWebhook(req, res) {
  // Webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token (should match what's stored in database)
    if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
      return res.status(200).send(challenge);
    }

    return res.status(403).end();
  }

  // Handle incoming messages
  if (req.method === 'POST') {
    const { entry } = req.body;

    // Process webhook events
    // Implementation depends on your chatbot logic

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function sendMessengerMessage(req, res) {
  const { organizationId, recipientId, message } = req.body;

  const integration = await sql`
    SELECT credentials_encrypted FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = 'messenger' AND status = 'active'
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ error: 'Messenger not connected' });
  }

  const accessToken = integration[0].credentials_encrypted;

  const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message }
    })
  });

  if (!response.ok) {
    return res.status(400).json({ error: 'Failed to send message' });
  }

  return res.status(200).json({ success: true, message: 'Message sent' });
}

// ============== GENERAL FUNCTIONS ==============

async function listIntegrations(req, res) {
  const { organizationId } = req.body || req.query;

  const integrations = await sql`
    SELECT integration_id, integration_name, status, connected_at
    FROM integrations
    WHERE organization_id = ${organizationId}
  `;

  return res.status(200).json({ 
    success: true, 
    integrations: integrations.map(i => ({
      id: i.integration_id,
      name: i.integration_name,
      status: i.status,
      connectedAt: i.connected_at
    }))
  });
}

async function getIntegrationStatus(req, res) {
  const { organizationId, integrationId } = req.body || req.query;

  const integration = await sql`
    SELECT integration_name, status, connected_at
    FROM integrations
    WHERE organization_id = ${organizationId} AND integration_id = ${integrationId}
    LIMIT 1
  `;

  if (integration.length === 0) {
    return res.status(404).json({ connected: false });
  }

  return res.status(200).json({ 
    connected: integration[0].status === 'active',
    name: integration[0].integration_name,
    connectedAt: integration[0].connected_at
  });
}

async function disconnectIntegration(req, res, integrationId) {
  const { organizationId } = req.body;

  await sql`
    UPDATE integrations
    SET status = 'disconnected'
    WHERE organization_id = ${organizationId} AND integration_id = ${integrationId}
  `;

  return res.status(200).json({ success: true, message: 'Integration disconnected' });
}
