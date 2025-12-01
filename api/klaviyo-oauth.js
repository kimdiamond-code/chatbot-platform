// ===================================================================
// KLAVIYO OAUTH ENDPOINTS
// Handles OAuth flow for users to connect their Klaviyo accounts
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

const KLAVIYO_CLIENT_ID = process.env.VITE_KLAVIYO_API_KEY;
const KLAVIYO_CLIENT_SECRET = process.env.VITE_KLAVIYO_API_SECRET;
const REDIRECT_URI = process.env.KLAVIYO_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/oauth/klaviyo/callback';
const SCOPES = 'lists:read lists:write profiles:read profiles:write metrics:read events:write';

export default async function handler(req, res) {
  const { method, query, url } = req;
  
  // Detect action from URL path
  const isRedirect = url.includes('/redirect');
  const isCallback = url.includes('/callback');

  // ============================================================
  // INITIATE OAUTH (Redirect to Klaviyo)
  // ============================================================
  if (isRedirect && method === 'GET') {
    const { organization_id } = query;

    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id required' });
    }

    try {
      // Generate state token
      const state = Buffer.from(JSON.stringify({
        organization_id,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      })).toString('base64');

      // Build Klaviyo OAuth URL
      const authUrl = 'https://www.klaviyo.com/oauth/authorize?' +
        `client_id=${KLAVIYO_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `state=${state}`;

      console.log('🔀 Redirecting to Klaviyo OAuth');

      return res.redirect(authUrl);

    } catch (error) {
      console.error('❌ OAuth redirect failed:', error);
      return res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  }

  // ============================================================
  // OAUTH CALLBACK (Handle Klaviyo redirect)
  // ============================================================
  if (isCallback && method === 'GET') {
    const { code, state, error, error_description } = query;

    // Check for OAuth error
    if (error) {
      console.error('❌ Klaviyo OAuth error:', error, error_description);
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?klaviyo=error&message=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    try {
      // Decode state
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      const { organization_id } = stateData;

      console.log('✅ OAuth callback received for org:', organization_id);

      // Exchange code for access token
      const tokenUrl = 'https://a.klaviyo.com/oauth/token';
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: KLAVIYO_CLIENT_ID,
          client_secret: KLAVIYO_CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const { access_token, refresh_token, scope } = tokenData;

      console.log('🔑 Access token received');

      // Get account info
      const accountResponse = await fetch('https://a.klaviyo.com/api/accounts/', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'revision': '2024-07-15'
        }
      });

      const accountData = await accountResponse.json();
      const account = accountData.data?.[0];
      const companyId = account?.id;
      const companyName = account?.attributes?.name || 'Klaviyo Account';

      console.log('📊 Connected to account:', companyName, companyId);

      // Encrypt tokens
      const encryptedAccessToken = tokenEncryptionService.encrypt(access_token);
      const encryptedRefreshToken = refresh_token ? tokenEncryptionService.encrypt(refresh_token) : null;

      // Store in database
      const existing = await sql`
        SELECT id FROM integrations 
        WHERE organization_id = ${organization_id} AND provider = 'klaviyo'
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE integrations 
          SET 
            access_token = ${encryptedAccessToken},
            refresh_token = ${encryptedRefreshToken},
            account_identifier = ${JSON.stringify({ companyId, companyName })},
            token_scope = ${scope},
            status = 'connected',
            connected_at = NOW(),
            updated_at = NOW()
          WHERE organization_id = ${organization_id} AND provider = 'klaviyo'
        `;
      } else {
        // Insert new
        await sql`
          INSERT INTO integrations 
            (organization_id, provider, access_token, refresh_token, account_identifier, token_scope, status, connected_at)
          VALUES 
            (${organization_id}, 'klaviyo', ${encryptedAccessToken}, ${encryptedRefreshToken}, ${JSON.stringify({ companyId, companyName })}, ${scope}, 'connected', NOW())
        `;
      }

      console.log('✅ Klaviyo integration saved for org:', organization_id);

      // Redirect back to frontend
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?klaviyo=connected&account=${encodeURIComponent(companyName)}`);

    } catch (error) {
      console.error('❌ OAuth callback failed:', error);
      
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?klaviyo=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
