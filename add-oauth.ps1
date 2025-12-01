# PowerShell script to add OAuth handlers to consolidated.js

$projectPath = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
$consolidatedPath = "$projectPath\api\consolidated.js"

Write-Host "Reading consolidated.js..." -ForegroundColor Cyan
$content = Get-Content $consolidatedPath -Raw

# 1. Add tokenEncryptionService import after other imports
Write-Host "Adding tokenEncryptionService import..." -ForegroundColor Yellow
$content = $content -replace "import promptSecurity from './promptSecurityBackend.js';", "import promptSecurity from './promptSecurityBackend.js';`nimport tokenEncryptionService from './tokenEncryptionService.js';"

# 2. Add OAuth endpoints before messenger-webhook section
Write-Host "Adding OAuth endpoints..." -ForegroundColor Yellow

$oauthCode = @"

    // ============================================================
    // SHOPIFY OAUTH
    // ============================================================
    if (endpoint === 'shopify-oauth-redirect' && method === 'GET') {
      const { organization_id, shop } = query;

      if (!organization_id || !shop) {
        return res.status(400).json({ error: 'organization_id and shop required' });
      }

      const SHOPIFY_CLIENT_ID = process.env.VITE_SHOPIFY_API_KEY;
      const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/consolidated?endpoint=shopify-oauth-callback';
      const SCOPES = 'read_products,read_orders,read_customers,read_inventory,read_locations,read_draft_orders';

      const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
      const stateData = Buffer.from(JSON.stringify({
        organization_id,
        timestamp: Date.now(),
        random: crypto.randomBytes(32).toString('hex')
      })).toString('base64');

      const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${SHOPIFY_CLIENT_ID}&` +
        `scope=${SCOPES}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `state=${stateData}`;

      console.log('🔀 Redirecting to Shopify OAuth:', shopDomain);
      return res.redirect(authUrl);
    }

    if (endpoint === 'shopify-oauth-callback' && method === 'GET') {
      const { code, shop, state, hmac } = query;

      if (!code || !shop || !state) {
        return res.status(400).json({ error: 'Missing OAuth parameters' });
      }

      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        const { organization_id } = stateData;

        const SHOPIFY_CLIENT_ID = process.env.VITE_SHOPIFY_API_KEY;
        const SHOPIFY_CLIENT_SECRET = process.env.VITE_SHOPIFY_API_SECRET;

        // Verify HMAC
        const { hmac: receivedHmac, ...params } = query;
        const message = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
        const hash = crypto.createHmac('sha256', SHOPIFY_CLIENT_SECRET).update(message).digest('hex');

        if (hash !== receivedHmac) {
          throw new Error('Invalid HMAC signature');
        }

        // Exchange code for token
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: SHOPIFY_CLIENT_ID,
            client_secret: SHOPIFY_CLIENT_SECRET,
            code: code
          })
        });

        const tokenData = await tokenResponse.json();
        const { access_token, scope } = tokenData;

        // Encrypt and store
        const encryptedToken = tokenEncryptionService.encrypt(access_token);
        const storeName = shop.replace('.myshopify.com', '');

        const existing = await sql`SELECT id FROM integrations WHERE organization_id = ${organization_id} AND provider = 'shopify'`;

        if (existing.length > 0) {
          await sql`UPDATE integrations SET access_token = ${encryptedToken}, account_identifier = ${JSON.stringify({ storeName, shop })}, token_scope = ${scope}, status = 'connected', connected_at = NOW(), updated_at = NOW() WHERE organization_id = ${organization_id} AND provider = 'shopify'`;
        } else {
          await sql`INSERT INTO integrations (organization_id, provider, access_token, account_identifier, token_scope, status, connected_at) VALUES (${organization_id}, 'shopify', ${encryptedToken}, ${JSON.stringify({ storeName, shop })}, ${scope}, 'connected', NOW())`;
        }

        const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
        return res.redirect(`${redirectUrl}/dashboard/integrations?shopify=connected`);
      } catch (error) {
        console.error('❌ Shopify OAuth failed:', error);
        const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
        return res.redirect(`${redirectUrl}/dashboard/integrations?shopify=error&message=${encodeURIComponent(error.message)}`);
      }
    }

    // ============================================================
    // MESSENGER OAUTH
    // ============================================================
    if (endpoint === 'messenger-oauth-redirect' && method === 'GET') {
      const { organization_id } = query;

      if (!organization_id) {
        return res.status(400).json({ error: 'organization_id required' });
      }

      const MESSENGER_APP_ID = process.env.VITE_MESSENGER_APP_ID;
      const REDIRECT_URI = process.env.MESSENGER_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/consolidated?endpoint=messenger-oauth-callback';

      const state = Buffer.from(JSON.stringify({
        organization_id,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      })).toString('base64');

      const scope = 'pages_messaging,pages_manage_metadata,pages_read_engagement';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${MESSENGER_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `state=${state}&` +
        `scope=${scope}`;

      console.log('🔀 Redirecting to Facebook OAuth');
      return res.redirect(authUrl);
    }

    if (endpoint === 'messenger-oauth-callback' && method === 'GET') {
      const { code, state, error, error_description } = query;

      if (error) {
        const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
        return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=error&message=${encodeURIComponent(error_description || error)}`);
      }

      if (!code || !state) {
        return res.status(400).json({ error: 'Missing OAuth parameters' });
      }

      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        const { organization_id } = stateData;

        const MESSENGER_APP_ID = process.env.VITE_MESSENGER_APP_ID;
        const MESSENGER_APP_SECRET = process.env.VITE_MESSENGER_APP_SECRET;
        const REDIRECT_URI = process.env.MESSENGER_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/consolidated?endpoint=messenger-oauth-callback';

        // Exchange code for token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${MESSENGER_APP_ID}&client_secret=${MESSENGER_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();
        const userAccessToken = tokenData.access_token;

        // Get pages
        const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`);
        const pagesData = await pagesResponse.json();
        const pages = pagesData.data || [];

        if (pages.length === 0) {
          throw new Error('No Facebook Pages found');
        }

        const page = pages[0];
        const pageAccessToken = page.access_token;
        const pageId = page.id;
        const pageName = page.name;

        // Get long-lived token
        const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${MESSENGER_APP_ID}&client_secret=${MESSENGER_APP_SECRET}&fb_exchange_token=${pageAccessToken}`;
        const longLivedResponse = await fetch(longLivedUrl);
        const longLivedData = await longLivedResponse.json();
        const longLivedToken = longLivedData.access_token || pageAccessToken;

        // Subscribe app to page
        await fetch(`https://graph.facebook.com/v18.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${longLivedToken}`, { method: 'POST' });

        // Encrypt and store
        const encryptedToken = tokenEncryptionService.encrypt(longLivedToken);

        const existing = await sql`SELECT id FROM integrations WHERE organization_id = ${organization_id} AND provider = 'messenger'`;

        if (existing.length > 0) {
          await sql`UPDATE integrations SET access_token = ${encryptedToken}, account_identifier = ${JSON.stringify({ pageId, pageName })}, status = 'connected', connected_at = NOW(), updated_at = NOW() WHERE organization_id = ${organization_id} AND provider = 'messenger'`;
        } else {
          await sql`INSERT INTO integrations (organization_id, provider, access_token, account_identifier, status, connected_at) VALUES (${organization_id}, 'messenger', ${encryptedToken}, ${JSON.stringify({ pageId, pageName })}, 'connected', NOW())`;
        }

        const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
        return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=connected&page=${encodeURIComponent(pageName)}`);
      } catch (error) {
        console.error('❌ Messenger OAuth failed:', error);
        const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
        return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=error&message=${encodeURIComponent(error.message)}`);
      }
    }

"@

# Insert OAuth code before messenger-webhook section
$content = $content -replace "    // ============================================================`n    // MESSENGER WEBHOOK", "$oauthCode    // ============================================================`n    // MESSENGER WEBHOOK"

# Save the file
Write-Host "Saving consolidated.js..." -ForegroundColor Green
$content | Set-Content $consolidatedPath -NoNewline

Write-Host "`n✅ OAuth handlers added successfully!" -ForegroundColor Green
Write-Host "`nNow run: " -ForegroundColor Cyan
Write-Host "git add api/consolidated.js src/components/CentralizedIntegrations.jsx" -ForegroundColor Yellow
Write-Host "git commit -m 'Add OAuth to consolidated endpoint'" -ForegroundColor Yellow
Write-Host "git push" -ForegroundColor Yellow
Write-Host "vercel --prod" -ForegroundColor Yellow
