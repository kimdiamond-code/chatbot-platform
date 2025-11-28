// ===================================================================
// SHOPIFY OAUTH ENDPOINTS
// Handles OAuth flow for users to connect their Shopify stores
// ===================================================================

import { getDatabase } from './database-config.js';
import tokenEncryptionService from './tokenEncryptionService.js';
import crypto from 'crypto';

let sql;
try {
  sql = getDatabase();
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

const SHOPIFY_CLIENT_ID = process.env.VITE_SHOPIFY_API_KEY;
const SHOPIFY_CLIENT_SECRET = process.env.VITE_SHOPIFY_API_SECRET;
const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback';
const SCOPES = 'read_products,read_orders,read_customers,read_inventory,read_locations,read_draft_orders';

export default async function handler(req, res) {
  const { method, query, url } = req;
  
  // Detect action from URL path
  const isRedirect = url.includes('/redirect');
  const isCallback = url.includes('/callback');

  // ============================================================
  // INITIATE OAUTH (Redirect to Shopify)
  // ============================================================
  if (isRedirect && method === 'GET') {
    const { organization_id, shop } = query;

    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id required' });
    }

    if (!shop) {
      return res.status(400).json({ error: 'shop parameter required (e.g., mystore.myshopify.com)' });
    }

    try {
      // Validate shop format
      const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

      // Generate state token for CSRF protection
      const state = crypto.randomBytes(32).toString('hex');

      // Store state temporarily (in production, use Redis or database)
      // For now, encode organization_id in state
      const stateData = Buffer.from(JSON.stringify({
        organization_id,
        timestamp: Date.now(),
        random: state
      })).toString('base64');

      // Build Shopify OAuth URL
      const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${SHOPIFY_CLIENT_ID}&` +
        `scope=${SCOPES}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `state=${stateData}`;

      console.log('🔀 Redirecting to Shopify OAuth:', shopDomain);

      // Redirect user to Shopify
      return res.redirect(authUrl);

    } catch (error) {
      console.error('❌ OAuth redirect failed:', error);
      return res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  }

  // ============================================================
  // OAUTH CALLBACK (Handle Shopify redirect)
  // ============================================================
  if (isCallback && method === 'GET') {
    const { code, shop, state, hmac } = query;

    if (!code || !shop || !state) {
      return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    try {
      // Decode state to get organization_id
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      const { organization_id } = stateData;

      console.log('✅ OAuth callback received for org:', organization_id, 'shop:', shop);

      // Verify HMAC (Shopify security)
      const isValid = verifyShopifyHmac(query, SHOPIFY_CLIENT_SECRET);
      if (!isValid) {
        console.error('❌ Invalid HMAC');
        return res.status(403).json({ error: 'Invalid request signature' });
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code: code
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const { access_token, scope } = tokenData;

      console.log('🔑 Access token received for shop:', shop);

      // Encrypt the token
      const encryptedToken = tokenEncryptionService.encrypt(access_token);

      // Extract store name from shop domain
      const storeName = shop.replace('.myshopify.com', '');

      // Store in database
      const existing = await sql`
        SELECT id FROM integrations 
        WHERE organization_id = ${organization_id} AND provider = 'shopify'
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE integrations 
          SET 
            access_token = ${encryptedToken},
            account_identifier = ${JSON.stringify({ storeName, shop })},
            token_scope = ${scope},
            status = 'connected',
            connected_at = NOW(),
            updated_at = NOW()
          WHERE organization_id = ${organization_id} AND provider = 'shopify'
        `;
      } else {
        // Insert new
        await sql`
          INSERT INTO integrations 
            (organization_id, provider, access_token, account_identifier, token_scope, status, connected_at)
          VALUES 
            (${organization_id}, 'shopify', ${encryptedToken}, ${JSON.stringify({ storeName, shop })}, ${scope}, 'connected', NOW())
        `;
      }

      console.log('✅ Shopify integration saved for org:', organization_id);

      // Redirect back to frontend
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?shopify=connected`);

    } catch (error) {
      console.error('❌ OAuth callback failed:', error);
      
      // Redirect to frontend with error
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?shopify=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}

// ============================================================
// HELPER: Verify Shopify HMAC
// ============================================================
function verifyShopifyHmac(query, secret) {
  const { hmac, ...params } = query;
  
  if (!hmac) return false;

  // Build message from query params
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Generate HMAC
  const hash = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return hash === hmac;
}
