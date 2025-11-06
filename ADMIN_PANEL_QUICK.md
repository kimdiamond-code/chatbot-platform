# 🔒 ADMIN PANEL - QUICK REFERENCE

## 🚀 Deploy in 2 Steps

```powershell
# Step 1: Activate
.\ACTIVATE_ADMIN_PANEL.bat

# Step 2: Deploy
.\DEPLOY_ADMIN_PANEL.bat
```

## 📊 What Changed

**Before:** All users saw everything (19 items + sensitive data)  
**After:** Role-appropriate views (5-16 items)

## 🎯 Admin Panel Features

| Section | What It Contains |
|---------|-----------------|
| 🔌 Webhooks | Endpoints, secrets, logs |
| 🔑 API Keys | OpenAI, Shopify, Klaviyo |
| 💻 Widget Code | Raw code + advanced config |
| 🔒 Security | GDPR, encryption, logs |
| 👥 Users | Create, edit, assign roles |

## 👥 Who Sees What

| User Type | Menu Items | Admin Panel |
|-----------|------------|-------------|
| User/Agent | 5 items | ❌ Hidden |
| Manager | 13 items | ❌ Hidden |
| Developer | 16 items | ✅ Visible |
| Admin | 16 items | ✅ Visible |

## 🔍 Widget Changes

**Regular Users:**
```
┌──────────────────┐
│  Widget          │
│                  │
│  [Install Now]   │
│  [Download Code] │
│                  │
│  No raw code!    │
└──────────────────┘
```

**Admins:**
```
Admin Panel → Widget Code
├─ Raw implementation
├─ Advanced config
├─ Custom CSS/JS
└─ Full control
```

## 🧪 Quick Test

```javascript
// Browser console:

// Check access
rbacService.canAccessFeature('admin')
// Admin/Dev: true, Others: false

// View accessible features
rbacService.getAccessibleFeatures()
```

## ✅ Success Check

Admin Panel works when:
- ✅ Admin sees "🔒 Admin Panel" in nav
- ✅ Users DON'T see Admin Panel
- ✅ Widget shows button (not code) for users
- ✅ Access Denied screen works

## 📋 Files Created

```
src/
├─ components/
│  ├─ AdminPanel.jsx ✨ NEW
│  └─ WidgetStudioSimplified.jsx
├─ services/
│  └─ rbacService.js
└─ App.jsx.adminpanel ✨ NEW

ACTIVATE_ADMIN_PANEL.bat ✨ NEW
DEPLOY_ADMIN_PANEL.bat ✨ NEW
ADMIN_PANEL_GUIDE.md ✨ NEW
ADMIN_PANEL_SUMMARY.md ✨ NEW
```

## 🔄 Rollback

```powershell
copy src\App.jsx.backup src\App.jsx -Force
git add . && git commit -m "Rollback" && git push
vercel --prod
```

## 🚨 Security

**Default Admin:**
- Email: admin@chatbot.com
- Password: admin123
- ⚠️ **CHANGE IMMEDIATELY!**

## 📖 Full Docs

- **ADMIN_PANEL_SUMMARY.md** - Complete overview
- **ADMIN_PANEL_GUIDE.md** - Detailed guide

---

**Deploy now:** `.\ACTIVATE_ADMIN_PANEL.bat` + `.\DEPLOY_ADMIN_PANEL.bat`
