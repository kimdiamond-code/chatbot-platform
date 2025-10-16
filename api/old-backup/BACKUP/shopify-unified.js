/**
 * UNIFIED SHOPIFY API HANDLER
 * Consolidates all Shopify endpoints into one serverless function
 * Routes: OAuth, Products, Cart, Orders, Customers, Inventory
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// CORS Helper
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
    const { action } = req.body || req.query;

    // ============== OAUTH ROUTES ==============
    if (action === 'oauth:initiate') {
      return await initiateOAuth(req, res);
    }

    if (action === 'oauth:callback') {
      return await handleOAuthCallback(req, res);
    }

    if (action === 'oauth:verify') {
      return await verifyConnection(req, res);
    }

    // ============== PRODUCT ROUTES ==============
    if (action === 'products:list') {
      return await listProducts(req, res);
    }

    if (action === 'products:get') {
      return await getProduct(req, res);
    }

    if (action === 'products:search') {
      return await searchProducts(req, res);
    }

    // ============== CART ROUTES ==============
    if (action === 'cart:abandoned') {
      return await getAbandonedCarts(req, res);
    }

    if (action === 'cart:create') {
      return await createDraftOrder(req, res);
    }

    // ============== ORDER ROUTES ==============
    if (action === 'orders:list') {
      return await listOrders(req, res);
    }

    if (action === 'orders:get') {
      return await getOrder(req, res);
    }

    // ============== CUSTOMER ROUTES ==============
    if (action === 'customers:list') {
      return await listCustomers(req, res);
    }

    if (action === 'customers:search') {
      return await searchCustomers(req, res);
    }

    // ============== INVENTORY ROUTES ==============
    if (action === 'inventory:check') {
      return await checkInventory(req, res);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Shopify API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============== OAUTH FUNCTIONS ==============

async function initiateOAuth(req, res) {
  const { shop, organizationId } = req.body;

  if (!shop) {
    return res.status(400).json({ error: 'Shop domain required' });
  }

  // Clean shop domain
  let shopDomain = shop.toLowerCase().trim()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace('.myshopify.com', '');

  if (!/^[a-z0-9-]+$/.test(shopDomain)) {
    return res.status(400).json({ error: 'Invalid shop domain' });
  }

  // Generate state token
  const state = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Store in database
  await sql`
    INSERT INTO oauth_states (state_token, provider, shop_domain, organization_id, expires_at)
    VALUES (${state}, 'shopify', ${shopDomain}, ${organizationId || '00000000-0000-0000-0000-000000000001'}, ${expiresAt.toISOString()})
  `;

  // Build OAuth URL
  const authUrl = `https://${shopDomain}.myshopify.com/admin/oauth/authorize?` +
    `client_id=${encodeURIComponent(process.env.SHOPIFY_CLIENT_ID)}&` +
    `scope=${encodeURIComponent(process.env.SHOPIFY_SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(process.env.SHOPIFY_REDIRECT_URI)}&` +
    `state=${encodeURIComponent(state)}`;

  return res.status(200).json({ authUrl, state, shop: shopDomain });
}

async function handleOAuthCallback(req, res) {
  const { code, state, shop } = req.query;

  if (!code || !state || !shop) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Verify state
  const stateRecord = await sql`
    SELECT * FROM oauth_states 
    WHERE state_token = ${state} 
    AND expires_at > NOW()
    AND provider = 'shopify'
    LIMIT 1
  `;

  if (stateRecord.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired state' });
  }

  // Exchange code for access token
  const tokenResponse = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange OAuth code');
  }

  const { access_token, scope } = await tokenResponse.json();

  // Save to database
  await sql`
    INSERT INTO shopify_connections (organization_id, shop_domain, access_token, scopes, status)
    VALUES (${stateRecord[0].organization_id}, ${shop}, ${access_token}, ${scope}, 'active')
    ON CONFLICT (organization_id, shop_domain)
    DO UPDATE SET access_token = ${access_token}, scopes = ${scope}, status = 'active', connected_at = NOW()
  `;

  // Delete used state
  await sql`DELETE FROM oauth_states WHERE state_token = ${state}`;

  return res.status(200).json({ success: true, shop });
}

async function verifyConnection(req, res) {
  const { organizationId } = req.body;

  const connections = await sql`
    SELECT shop_domain, scopes, status, connected_at 
    FROM shopify_connections 
    WHERE organization_id = ${organizationId} AND status = 'active'
  `;

  return res.status(200).json({ 
    connected: connections.length > 0,
    connections: connections.map(c => ({
      shop: c.shop_domain,
      scopes: c.scopes,
      connectedAt: c.connected_at
    }))
  });
}

// ============== SHOPIFY API HELPERS ==============

async function getShopifyClient(organizationId) {
  const connection = await sql`
    SELECT shop_domain, access_token 
    FROM shopify_connections 
    WHERE organization_id = ${organizationId} AND status = 'active'
    LIMIT 1
  `;

  if (connection.length === 0) {
    throw new Error('No active Shopify connection');
  }

  const { shop_domain, access_token } = connection[0];
  const baseUrl = `https://${shop_domain}.myshopify.com/admin/api/2024-10`;

  return {
    shop: shop_domain,
    async fetch(endpoint, options = {}) {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      return response.json();
    }
  };
}

// ============== PRODUCT FUNCTIONS ==============

async function listProducts(req, res) {
  const { organizationId, limit = 50 } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/products.json?limit=${limit}&status=active`);
  
  return res.status(200).json({ 
    success: true, 
    products: data.products.map(formatProduct),
    count: data.products.length 
  });
}

async function getProduct(req, res) {
  const { organizationId, productId } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/products/${productId}.json`);
  
  return res.status(200).json({ 
    success: true, 
    product: formatProduct(data.product) 
  });
}

async function searchProducts(req, res) {
  const { organizationId, query, limit = 50 } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/products.json?title=${encodeURIComponent(query)}&limit=${limit}`);
  
  return res.status(200).json({ 
    success: true, 
    products: data.products.map(formatProduct),
    count: data.products.length 
  });
}

function formatProduct(product) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.body_html,
    vendor: product.vendor,
    type: product.product_type,
    tags: product.tags,
    images: product.images?.map(img => ({
      id: img.id,
      src: img.src,
      alt: img.alt
    })) || [],
    variants: product.variants?.map(v => ({
      id: v.id,
      title: v.title,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      sku: v.sku,
      inventory: v.inventory_quantity
    })) || []
  };
}

// ============== CART FUNCTIONS ==============

async function getAbandonedCarts(req, res) {
  const { organizationId, limit = 10 } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/checkouts.json?limit=${limit}&status=open`);
  
  return res.status(200).json({ 
    success: true, 
    checkouts: data.checkouts || [],
    count: data.checkouts?.length || 0 
  });
}

async function createDraftOrder(req, res) {
  const { organizationId, customerEmail, lineItems, note } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch('/draft_orders.json', {
    method: 'POST',
    body: JSON.stringify({
      draft_order: {
        line_items: lineItems,
        customer: { email: customerEmail },
        note: note || ''
      }
    })
  });
  
  return res.status(200).json({ success: true, draftOrder: data.draft_order });
}

// ============== ORDER FUNCTIONS ==============

async function listOrders(req, res) {
  const { organizationId, limit = 50, status = 'any' } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/orders.json?limit=${limit}&status=${status}`);
  
  return res.status(200).json({ 
    success: true, 
    orders: data.orders || [],
    count: data.orders?.length || 0 
  });
}

async function getOrder(req, res) {
  const { organizationId, orderId } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/orders/${orderId}.json`);
  
  return res.status(200).json({ success: true, order: data.order });
}

// ============== CUSTOMER FUNCTIONS ==============

async function listCustomers(req, res) {
  const { organizationId, limit = 50 } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/customers.json?limit=${limit}`);
  
  return res.status(200).json({ 
    success: true, 
    customers: data.customers || [],
    count: data.customers?.length || 0 
  });
}

async function searchCustomers(req, res) {
  const { organizationId, query, limit = 50 } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/customers/search.json?query=${encodeURIComponent(query)}&limit=${limit}`);
  
  return res.status(200).json({ 
    success: true, 
    customers: data.customers || [],
    count: data.customers?.length || 0 
  });
}

// ============== INVENTORY FUNCTIONS ==============

async function checkInventory(req, res) {
  const { organizationId, variantId } = req.body;
  const client = await getShopifyClient(organizationId);
  
  const data = await client.fetch(`/inventory_levels.json?inventory_item_ids=${variantId}`);
  
  return res.status(200).json({ 
    success: true, 
    inventory: data.inventory_levels || [] 
  });
}
