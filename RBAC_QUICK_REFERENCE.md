# 🔐 RBAC QUICK REFERENCE

## 🚀 Quick Setup (2 Commands)

```powershell
# 1. Activate RBAC
.\ACTIVATE_RBAC.bat

# 2. Deploy
.\DEPLOY_WITH_RBAC.bat
```

## 👥 User Roles Overview

| Role | Access Level | Use Case |
|------|--------------|----------|
| **Admin** 🔴 | Full Control | Platform owner, IT admin |
| **Developer** 🟣 | Technical Access | Developers, tech team |
| **Manager** 🔵 | Operations | Content managers, supervisors |
| **Agent** 🟢 | Support | Customer service agents |
| **User** ⚪ | Minimal | End users, viewers |

## ❌ Features Hidden from Regular Users

### Admin/Developer Only:
- ❌ Webhooks
- ❌ Security & Compliance  
- ❌ API Keys & Integrations
- ❌ Raw Widget Code

### Admin Only:
- ❌ User Management (Create/Delete Users)

### All Regular Users:
- ✅ Widget (Install Button - No Code)
- ✅ Dashboard (View Mode)
- ✅ Conversations (Own or Assigned)

## 📊 Quick Permission Matrix

| Feature | Admin | Dev | Manager | Agent | User |
|---------|-------|-----|---------|-------|------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bot Builder | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Webhooks** | **✅** | **✅** | **❌** | **❌** | **❌** |
| **Security** | **✅** | **✅** | **❌** | **❌** | **❌** |
| **Integrations** | **✅** | **✅** | **❌** | **❌** | **❌** |
| **Users** | **✅** | **❌** | **❌** | **❌** | **❌** |
| Widget (Code) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Widget (Button) | N/A | N/A | N/A | ✅ | ✅ |

## 📁 Files Created

| File | Purpose |
|------|---------|
| `rbacService.js` | Core RBAC logic |
| `App.jsx.rbac` | RBAC-enabled app |
| `WidgetStudioSimplified.jsx` | User-friendly widget |
| `ACTIVATE_RBAC.bat` | Setup script |
| `DEPLOY_WITH_RBAC.bat` | Deploy script |

## 🧪 Test Commands

```javascript
// Browser console:

// Check role
rbacService.getUserRole()
// → 'admin' or 'user' etc.

// Check feature access
rbacService.canAccessFeature('webhooks')
// → true (admin/dev) or false (others)

// Get all accessible features
rbacService.getAccessibleFeatures()
// → ['dashboard', 'conversations', ...]
```

## ⚙️ Manual Step Required

**File:** `src/components/CleanModernNavigation.jsx`

**Find:**
```javascript
const CleanModernNavigation = ({ activeTab, setActiveTab, ... }) => {
```

**Add `navigation` prop:**
```javascript
const CleanModernNavigation = ({ activeTab, setActiveTab, ..., navigation }) => {
```

**Find navigation array:**
```javascript
const navigation = [ /* items */ ];
```

**Replace with:**
```javascript
const navItems = navigation || [];
```

**Update rendering:**
Use `navItems` instead of `navigation` in map functions.

## 🔒 Security Defaults

**Default Admin:**
- Email: admin@chatbot.com
- Password: admin123
- ⚠️ CHANGE PASSWORD IMMEDIATELY!

## 🎯 What Changed

### Before:
- ✅ All users saw ALL features
- ✅ Raw widget code visible to everyone
- ✅ Webhooks, API keys, security visible
- ✅ No role restrictions

### After:
- ✅ Role-based feature filtering
- ✅ Widget button only for regular users
- ✅ Admin features hidden from users
- ✅ 5 distinct role levels

## 🚨 Troubleshooting

**Navigation not filtered?**
→ Check CleanModernNavigation accepts `navigation` prop

**All features still showing?**
→ Verify RBAC activated: Check App.jsx imports rbacService

**Widget shows code for users?**
→ Check WidgetStudioSimplified is imported, not WidgetStudio

**Role not recognized?**
→ Check user.role in localStorage matches ROLES constant

## 📋 Deployment Checklist

- [ ] Run `ACTIVATE_RBAC.bat`
- [ ] Update CleanModernNavigation.jsx
- [ ] Test locally (npm run dev)
- [ ] Test different roles
- [ ] Run `DEPLOY_WITH_RBAC.bat`
- [ ] Change admin password
- [ ] Test in production
- [ ] Remove role indicator badge

## 🔄 Rollback

```powershell
copy src\App.jsx.backup src\App.jsx -Force
git add . && git commit -m "Rollback RBAC" && git push
vercel --prod
```

## 📚 Full Documentation

See **RBAC_IMPLEMENTATION_GUIDE.md** for:
- Detailed role definitions
- Complete permission list
- Customization guide
- Security best practices

---

**Access control is now active! Regular users see only what they need.**
