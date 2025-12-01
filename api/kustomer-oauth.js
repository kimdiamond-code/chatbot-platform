// ===================================================================
// KUSTOMER OAUTH ENDPOINTS
// Handles OAuth flow for users to connect their Kustomer accounts
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

const KUSTOMER_CLIENT_ID = process.env.VITE_KUSTOMER_CLIENT_ID;
const KUSTOMER_CLIENT_SECRET = process.env.VITE_KUSTOMER_CLIENT_SECRET;
const REDIRECT_URI = process.env.KUSTOMER_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/oauth/kustomer/callback';

export default async function handler(req, res) {
  const { method, query, url } = req;
  
  // Detect action from URL path
  const isRedirect = url.includes('/redirect');
  const isCallback = url.includes('/callback');

  // ============================================================
  // INITIATE OAUTH (Redirect to Kustomer)
  // ============================================================
  if (isRedirect && method === 'GET') {
    const { organization_id, subdomain } = query;

    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id required' });
    }

    if (!subdomain) {
      return res.status(400).json({ error: 'subdomain required (e.g., "mycompany" from mycompany.kustomerapp.com)' });
    }

    try {
      // Generate state token
      const state = Buffer.from(JSON.stringify({
        organization_id,
        subdomain,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      })).toString('base64');

      // Build Kustomer OAuth URL
      const authUrl = `https://${subdomain}.kustomerapp.com/oauth/authorize?` +
        `client_id=${KUSTOMER_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=org.user.read org.permission.customer.read org.permission.customer.write&` +
        `state=${state}`;

      console.log('🔀 Redirecting to Kustomer OAuth:', subdomain);

      return res.redirect(authUrl);

    } catch (error) {
      console.error('❌ OAuth redirect failed:', error);
      return res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  }

  // ============================================================
  // OAUTH CALLBACK (Handle Kustomer redirect)
  // ============================================================
  if (isCallback && method === 'GET') {
    const { code, state, error, error_description } = query;

    // Check for OAuth error
    if (error) {
      console.error('❌ Kustomer OAuth error:', error, error_description);
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?kustomer=error&message=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    try {
      // Decode state
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      const { organization_id, subdomain } = stateData;

      console.log('✅ OAuth callback received for org:', organization_id, 'subdomain:', subdomain);

      // Exchange code for access token
      const tokenUrl = `https://${subdomain}.kustomerapp.com/oauth/token`;
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: KUSTOMER_CLIENT_ID,
          client_secret: KUSTOMER_CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const { access_token, refresh_token } = tokenData;

      console.log('🔑 Access token received');

      // Get org info
      const orgResponse = await fetch(`https://${subdomain}.kustomerapp.com/v1/org`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const orgData = await orgResponse.json();
      const orgName = orgData.data?.attributes?.displayName || subdomain;

      console.log('🏢 Connected to organization:', orgName);

      // Encrypt tokens
      const encryptedAccessToken = tokenEncryptionService.encrypt(access_token);
      const encryptedRefreshToken = refresh_token ? tokenEncryptionService.encrypt(refresh_token) : null;

      // Store in database
      const existing = await sql`
        SELECT id FROM integrations 
        WHERE organization_id = ${organization_id} AND provider = 'kustomer'
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE integrations 
          SET 
            access_token = ${encryptedAccessToken},
            refresh_token = ${encryptedRefreshToken},
            account_identifier = ${JSON.stringify({ subdomain, orgName })},
            status = 'connected',
            connected_at = NOW(),
            updated_at = NOW()
          WHERE organization_id = ${organization_id} AND provider = 'kustomer'
        `;
      } else {
        // Insert new
        await sql`
          INSERT INTO integrations 
            (organization_id, provider, access_token, refresh_token, account_identifier, status, connected_at)
          VALUES 
            (${organization_id}, 'kustomer', ${encryptedAccessToken}, ${encryptedRefreshToken}, ${JSON.stringify({ subdomain, orgName })}, 'connected', NOW())
        `;
      }

      console.log('✅ Kustomer integration saved for org:', organization_id);

      // Redirect back to frontend
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?kustomer=connected&org=${encodeURIComponent(orgName)}`);

    } catch (error) {
      console.error('❌ OAuth callback failed:', error);
      
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?kustomer=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
