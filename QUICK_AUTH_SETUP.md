# 🚀 Quick Authentication Setup

## Option 1: Run Step-by-Step SQL (Recommended)

1. **Go to your Neon Database Console**
   - https://console.neon.tech/
   - Select your project: `agentstack_ai_chatbot`
   - Click "SQL Editor"

2. **Copy and paste** the contents of:
   ```
   sql/STEP_BY_STEP_AUTH_SETUP.sql
   ```

3. **Click "Run"**

4. **Verify** you see:
   ```
   admin@chatbot.com | Admin User | admin | true
   user@chatbot.com  | Test User  | agent| true
   ```

## Option 2: Skip Database Setup (Deploy First)

The authentication will work even without the database migration because the API handles user creation on-the-fly. You can:

1. **Deploy immediately:**
   ```bash
   vercel --prod
   ```

2. **Login with test credentials:**
   - Admin: `admin@chatbot.com` / `admin123`
   - User: `user@chatbot.com` / `user123`

3. **Create users via Admin panel** after logging in

## ✅ After Setup

### Test Login:
1. Go to your deployed URL
2. You'll see a login page
3. Enter:
   - **Email:** `admin@chatbot.com`
   - **Password:** `admin123`
4. Click "Sign In"
5. You should be logged in!

### Create New Users:
1. Login as admin
2. Click on "Users" in navigation (admin only)
3. Click "➕ Add User"
4. Fill in details and click "Create User"
5. Give credentials to your team members

## 🎯 Login Credentials

**Admin (Testing & Management):**
- Email: `admin@chatbot.com`
- Password: `admin123`
- Access: Everything + User Management

**Test User (Training):**
- Email: `user@chatbot.com`
- Password: `user123`
- Access: Bot training, Live Chat, Analytics

## 🔧 Troubleshooting

### If SQL fails:
1. Make sure `agents` table exists (run `neon_schema.sql` first)
2. Run each SQL statement one at a time
3. Check for error messages in Neon console

### If login doesn't work after deploy:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Check console for errors
4. Try incognito mode

### If "Invalid email or password":
1. Verify you typed exactly: `admin@chatbot.com`
2. Verify password: `admin123`
3. Check if database migration ran successfully

## 📋 Quick Deploy Command

```bash
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
vercel --prod
```

Wait 2-3 minutes for deployment, then test login!

---

**Need Help?** 
- Check browser console (F12)
- Check Vercel logs
- Verify database tables exist
