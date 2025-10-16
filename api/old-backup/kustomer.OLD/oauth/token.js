// Kustomer OAuth Token Exchange Endpoint
// /api/kustomer/oauth/token.js

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
    const { code, state, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    // Verify state parameter
    const stateData = await verifyOAuthState(state);
    if (!stateData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OAuth state'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(KUSTOMER_OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KUSTOMER_OAUTH_CONFIG.clientId,
        client_secret: KUSTOMER_OAUTH_CONFIG.clientSecret,
        code: code,
        redirect_uri: redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info to determine subdomain and organization
    const userInfoResponse = await fetch('https://api.kustomerapp.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const userInfo = await userInfoResponse.json();
    const user = userInfo.data;
    const orgData = user.relationships?.organization?.data;
    
    // Extract subdomain - this might need adjustment based on Kustomer's API
    let subdomain = 'unknown';
    if (orgData?.attributes?.subdomain) {
      subdomain = orgData.attributes.subdomain;
    } else if (user.attributes?.email) {
      // Try to extract from email domain as fallback
      const emailDomain = user.attributes.email.split('@')[1];
      if (emailDomain && emailDomain.includes('.')) {
        subdomain = emailDomain.split('.')[0];
      }
    }

    // Return token data and user info
    res.json({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      subdomain: subdomain,
      organization_id: orgData?.id,
      user_info: user
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Helper function to verify OAuth state
async function verifyOAuthState(state) {
  try {
    if (!state) return null;

    const { data, error } = await supabaseAdmin
      .from('kustomer_oauth_states')
      .select('*')
      .eq('state_token', state)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;

    // Mark state as used
    await supabaseAdmin
      .from('kustomer_oauth_states')
      .update({ used_at: new Date().toISOString() })
      .eq('id', data.id);

    return data;
  } catch (error) {
    console.error('Error verifying OAuth state:', error);
    return null;
  }
}