// Vercel API Route: /api/shopify/oauth/token.js
// Handles Shopify OAuth token exchange

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop, code, state } = req.body;

    // Validate input
    if (!shop || !code || !state) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify shop domain format
    if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop) && !/^[a-z0-9-]+$/.test(shop)) {
      return res.status(400).json({ error: 'Invalid shop domain' });
    }

    // Clean shop domain
    const shopDomain = shop.replace('.myshopify.com', '');

    // Verify OAuth state in database
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      return res.status(400).json({ error: 'Invalid or expired OAuth state' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://${shopDomain}.myshopify.com/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code: code
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Shopify token exchange failed:', errorText);
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();

    // Get shop information
    const shopInfoResponse = await fetch(`https://${shopDomain}.myshopify.com/admin/api/2024-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': tokenData.access_token
      }
    });

    let shopInfo = {};
    if (shopInfoResponse.ok) {
      const shopData = await shopInfoResponse.json();
      shopInfo = {
        name: shopData.shop.name,
        domain: shopData.shop.domain,
        email: shopData.shop.email,
        currency: shopData.shop.currency,
        timezone: shopData.shop.iana_timezone,
        plan_name: shopData.shop.plan_name
      };
    }

    // Store the installation in shopify_apps table
    const { error: appError } = await supabase
      .from('shopify_apps')
      .upsert({
        shop_domain: shopDomain,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        organization_id: stateData.organization_id,
        status: 'active',
        installed_at: new Date().toISOString()
      }, {
        onConflict: 'shop_domain'
      });

    if (appError) {
      console.error('Failed to store app installation:', appError);
      return res.status(500).json({ error: 'Failed to save installation' });
    }

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state_token', state);

    // Return success response
    res.status(200).json({
      access_token: tokenData.access_token,
      scope: tokenData.scope,
      shop_info: shopInfo,
      success: true
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}