// Kustomer OAuth Token Refresh Endpoint
// /api/kustomer/oauth/refresh.js

import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OAuth Configuration
const KUSTOMER_OAUTH_CONFIG = {
  clientId: process.env.VITE_KUSTOMER_CLIENT_ID,
  clientSecret: process.env.KUSTOMER_CLIENT_SECRET,
  tokenUrl: 'https://api.kustomerapp.com/oauth/token'
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const tokenResponse = await fetch(KUSTOMER_OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KUSTOMER_OAUTH_CONFIG.clientId,
        client_secret: KUSTOMER_OAUTH_CONFIG.clientSecret,
        refresh_token: refresh_token
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(`Token refresh failed: ${tokenResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const tokenData = await tokenResponse.json();

    res.json({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refresh_token, // Some OAuth servers don't return new refresh token
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    });

  } catch (error) {
    console.error('OAuth token refresh error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}