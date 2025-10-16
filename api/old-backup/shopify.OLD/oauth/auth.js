// Vercel API Route: /api/shopify/oauth/auth.js
// Initiates Shopify OAuth flow

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop, organizationId } = req.body;

    // Validate input
    if (!shop) {
      return res.status(400).json({ error: 'Shop domain is required' });
    }

    // Clean and validate shop domain
    let shopDomain = shop.toLowerCase().trim();
    shopDomain = shopDomain.replace(/^https?:\/\//, '');
    shopDomain = shopDomain.split('/')[0];
    
    if (shopDomain.includes('.myshopify.com')) {
      shopDomain = shopDomain.split('.myshopify.com')[0];
    }

    // Validate shop domain format
    if (!/^[a-z0-9-]+$/.test(shopDomain)) {
      return res.status(400).json({ error: 'Invalid shop domain format' });
    }

    // Generate secure state token
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store state in database
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state_token: state,
        provider: 'shopify',
        shop_domain: shopDomain,
        organization_id: organizationId || '00000000-0000-0000-0000-000000000001',
        expires_at: expiresAt.toISOString()
      });

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError);
      return res.status(500).json({ error: 'Failed to initiate OAuth' });
    }

    // Build Shopify OAuth URL
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers';
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    const authUrl = `https://${shopDomain}.myshopify.com/admin/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}`;

    res.status(200).json({
      authUrl,
      state,
      shop: shopDomain
    });

  } catch (error) {
    console.error('OAuth initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
