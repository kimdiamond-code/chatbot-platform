# CRITICAL FIX: Multi-Tenant Authentication

## Problem
ALL users are assigned to the same organization (ID: `00000000-0000-0000-0000-000000000001`), causing everyone to see the same data.

## Solution Steps

### Step 1: Run Database Migration
Connect to your Neon database and run:
```
sql/FIX_MULTI_TENANT_AUTH.sql
```

This creates:
- `users` table (global user accounts)
- `organization_users` junction table (links users to orgs)
- Adds auth columns to `agents` table
- Helper functions for org access

### Step 2: Update API - Signup Function
In `api/consolidated.js`, find the SIGNUP section (around line 950) and replace it with:

```javascript
// ==================== SIGNUP ====================
if (action === 'signup') {
  const { email, password, name, companyName } = body;
  
  try {
    // Check if users table exists
    try {
      await sql`SELECT 1 FROM users LIMIT 1`;
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database migration required. Run FIX_MULTI_TENANT_AUTH.sql first.' 
      });
    }
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }
    
    // ✅ FIX: Create NEW user
    const userResult = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name}, ${password})
      RETURNING id, email, name
    `;
    const newUser = userResult[0];
    
    // ✅ FIX: Create NEW organization for this user
    const orgName = companyName || `${name}'s Organization`;
    const subdomain = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
    
    const orgResult = await sql`
      INSERT INTO organizations (name, subdomain, owner_user_id)
      VALUES (${orgName}, ${subdomain}, ${newUser.id})
      RETURNING id, name, subdomain
    `;
    const newOrg = orgResult[0];
    
    // Link user to their organization
    await sql`
      INSERT INTO organization_users (organization_id, user_id, role, is_active)
      VALUES (${newOrg.id}, ${newUser.id}, 'owner', true)
    `;
    
    // Create default bot config
    await sql`
      INSERT INTO bot_configs (organization_id, name, personality, instructions, greeting_message)
      VALUES (
        ${newOrg.id}, 
        'Default Support Bot',
        'friendly, professional, helpful',
        'You are an AI assistant. Help users with their questions.',
        'Hi! How can I help you today?'
      )
    `;
    
    // Create agent record for backward compatibility
    const agentResult = await sql`
      INSERT INTO agents (organization_id, email, name, role, password_hash, is_active)
      VALUES (${newOrg.id}, ${email}, ${name}, 'admin', ${password}, true)
      RETURNING id
    `;
    
    // Create session
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await sql`
      INSERT INTO sessions (agent_id, token, expires_at)
      VALUES (${agentResult[0].id}, ${token}, ${expiresAt})
    `;
    
    console.log('✅ New organization created:', newOrg.id);
    
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'owner',
        organization_id: newOrg.id,
        organization_name: newOrg.name
      },
      token,
      expiresAt: expiresAt.toISOString(),
      message: 'Account created! Your organization is ready.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Signup failed: ' + error.message });
  }
}
```

### Step 3: Update Frontend Signup Form
In your signup component, add optional `companyName` field:

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  name: '',
  companyName: '' // Add this
})
```

### Step 4: Test
1. Create a test account
2. Verify it gets its own organization_id (not the default one)
3. Log out and create another test account  
4. Verify the two accounts see different data

### Step 5: Deploy
```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
git add .
git commit -m "Fix: Proper multi-tenant signup - each user gets own org"
git push
vercel --prod
```

## What This Fixes
- ❌ Before: All users → same org → see same data
- ✅ After: Each user → unique org → isolated data

## Verification Query
After signup, run in Neon:
```sql
SELECT 
  u.email,
  o.name as org_name,
  ou.role
FROM users u
JOIN organization_users ou ON u.id = ou.user_id
JOIN organizations o ON ou.organization_id = o.id;
```

You should see each user with their own organization.
