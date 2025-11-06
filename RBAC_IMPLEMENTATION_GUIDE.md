# 🔐 ROLE-BASED ACCESS CONTROL (RBAC) IMPLEMENTATION

## Overview

This update implements comprehensive role-based access control to limit what regular users can see and give full control to admin/developer roles.

## 🎭 User Roles

### 1. **Admin** (Full Access)
- Complete control over ALL features
- User management
- Security settings
- API keys & webhooks
- All integrations
- Billing management

### 2. **Developer** (Technical Full Access)
- All features EXCEPT user creation/deletion
- View all users
- Full bot configuration
- API keys & webhooks access
- Security & compliance tools
- All integrations

### 3. **Manager** (Content & Operations)
- View bot configuration (cannot edit code)
- Manage conversations
- View analytics & export
- Manage proactive engagement, scenarios, forms
- View billing
- NO access to: API keys, webhooks, security, integrations

### 4. **Agent** (Support Role)
- View conversations
- View analytics
- View bot configuration
- NO access to: editing, integrations, security, billing

### 5. **User** (Minimal Access)
- View own conversations only
- View bot configuration
- Install widget (button only, no code editing)

## 🚫 Features Restricted for Regular Users

### Removed from Regular Users:
1. ❌ **Webhooks** - Admin/Developer only
2. ❌ **Security & Compliance** - Admin/Developer only
3. ❌ **Integrations (API Keys)** - Admin/Developer only
4. ❌ **User Management** - Admin only
5. ❌ **Raw Widget Code** - Replaced with "Install Widget" button

### What Regular Users See:
- ✅ Dashboard (view metrics)
- ✅ Conversations (their own or assigned)
- ✅ Widget (install button, no code)
- ✅ Analytics (viewing only)
- ✅ Settings (limited)

## 📁 Files Created

### 1. **rbacService.js**
**Location:** `src/services/rbacService.js`

**What it does:**
- Defines all user roles (Admin, Developer, Manager, Agent, User)
- Defines all permissions (35+ granular permissions)
- Maps roles to permissions
- Maps features to allowed roles
- Provides helper functions for permission checks

**Key Methods:**
```javascript
rbacService.hasPermission(PERMISSIONS.VIEW_API_KEYS)
rbacService.canAccessFeature('webhooks')
rbacService.isAdminOrDeveloper()
rbacService.getAccessibleFeatures()
```

### 2. **App.jsx.rbac**
**Location:** `src/App.jsx.rbac`

**Changes:**
- Imports RBAC service
- Filters navigation based on user role
- Initializes RBAC on user login
- Shows role indicator (dev mode)
- Passes filtered navigation to components

### 3. **WidgetStudioSimplified.jsx**
**Location:** `src/components/WidgetStudioSimplified.jsx`

**Features:**
- Simple "Install Widget" interface for regular users
- Copy code button
- Download code button
- Installation guide modal
- Platform-specific instructions (WordPress, Shopify, etc.)
- Admin view shows full code editor

## 🚀 Deployment Steps

### Step 1: Backup Current Files

```powershell
# Backup App.jsx
copy src\App.jsx src\App.jsx.backup

# Navigate to project
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
```

### Step 2: Activate RBAC

```powershell
# Replace App.jsx with RBAC version
copy src\App.jsx.rbac src\App.jsx -Force

# Update CleanModernNavigation to accept navigation prop
# (Manual edit required - see instructions below)
```

### Step 3: Update Navigation Component

**File:** `src/components/CleanModernNavigation.jsx`

**Find this line** (around line 10-20):
```javascript
const CleanModernNavigation = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isMobile, realTimeMetrics }) => {
```

**Replace with:**
```javascript
const CleanModernNavigation = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isMobile, realTimeMetrics, navigation }) => {
```

**Then find the navigation items mapping** (around line 50-100):
```javascript
const navigation = [
  { id: 'dashboard', name: 'Dashboard', ... },
  // ... more items
];
```

**Replace the entire navigation array definition with:**
```javascript
// Use navigation prop passed from App.jsx
const navItems = navigation || [];
```

**Then update the rendering to use `navItems` instead of `navigation`**.

### Step 4: Update Widget Studio Import

**File:** `src/App.jsx`

**Find:**
```javascript
import WidgetStudio from './components/WidgetStudio.jsx';
```

**Replace with:**
```javascript
import WidgetStudio from './components/WidgetStudioSimplified.jsx';
```

### Step 5: Test Locally

```powershell
npm run dev
```

**Test different roles:**
1. Login as admin@chatbot.com (password: admin123)
2. Check navigation - should see ALL features
3. Logout and login as different role
4. Verify restricted features are hidden

### Step 6: Deploy

```powershell
# Commit changes
git add .
git commit -m "Implement role-based access control (RBAC) - Restrict user access to admin features"
git push origin main

# Deploy to Vercel
vercel --prod
```

## 🧪 Testing RBAC

### Browser Console Tests:

```javascript
// Check current role
console.log(rbacService.getUserRole());

// Check if user can access feature
console.log(rbacService.canAccessFeature('webhooks'));
// Admin/Developer: true, Others: false

// Check specific permission
console.log(rbacService.hasPermission('view_api_keys'));

// Get all accessible features
console.log(rbacService.getAccessibleFeatures());

// Get role display name
console.log(rbacService.getRoleDisplayName('admin'));
// Returns: "Administrator"
```

### Test User Accounts:

Create test users with different roles via UserManagement:

```javascript
// Via User Management page (Admin only)
1. Login as admin
2. Go to Users page
3. Create test users:
   - test-manager@company.com (role: manager)
   - test-agent@company.com (role: agent)
   - test-user@company.com (role: user)
4. Logout and test each role
```

## 📊 Role Permission Matrix

| Feature | Admin | Developer | Manager | Agent | User |
|---------|-------|-----------|---------|-------|------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bot Builder | ✅ | ✅ | ✅ | ❌ | ❌ |
| Conversations | ✅ (All) | ✅ (All) | ✅ (All) | ✅ (Own) | ✅ (Own) |
| Scenarios | ✅ | ✅ | ✅ | ❌ | ❌ |
| Forms | ✅ | ✅ | ✅ | ❌ | ❌ |
| Proactive | ✅ | ✅ | ✅ | ❌ | ❌ |
| CRM | ✅ | ✅ | ✅ | ❌ | ❌ |
| E-Commerce | ✅ | ✅ | ✅ | ❌ | ❌ |
| Channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Widget | ✅ (Code) | ✅ (Code) | ✅ (Code) | ✅ (Button) | ✅ (Button) |
| **Webhooks** | **✅** | **✅** | **❌** | **❌** | **❌** |
| Analytics | ✅ | ✅ | ✅ (View) | ✅ (View) | ❌ |
| **Integrations** | **✅** | **✅** | **❌** | **❌** | **❌** |
| **Security** | **✅** | **✅** | **❌** | **❌** | **❌** |
| **Users** | **✅** | **❌** | **❌** | **❌** | **❌** |
| Billing | ✅ | ✅ (View) | ✅ (View) | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ (Limited) | ✅ (Limited) | ✅ (Limited) |

## 🔒 Security Benefits

### 1. **Principle of Least Privilege**
- Users only see features they need
- Reduces attack surface
- Prevents accidental changes

### 2. **Data Protection**
- API keys hidden from non-admin users
- Webhooks not accessible to regular users
- Security settings protected

### 3. **Audit Trail**
- Role-based actions logged
- Clear responsibility assignment
- Compliance support

### 4. **User Experience**
- Simplified interface for regular users
- No overwhelming options
- Clear role boundaries

## 📝 Customizing Roles

### Add New Role:

**File:** `src/services/rbacService.js`

```javascript
// 1. Add role to ROLES constant
export const ROLES = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  MANAGER: 'manager',
  AGENT: 'agent',
  USER: 'user',
  CUSTOM_ROLE: 'custom_role', // NEW ROLE
};

// 2. Define permissions for new role
const rolePermissions = {
  // ... existing roles
  [ROLES.CUSTOM_ROLE]: [
    PERMISSIONS.VIEW_BOT_CONFIG,
    PERMISSIONS.VIEW_ANALYTICS,
    // ... add permissions
  ]
};

// 3. Add role to FEATURE_ACCESS
export const FEATURE_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT, ROLES.USER, ROLES.CUSTOM_ROLE],
  // ... update other features
};
```

### Modify Permissions:

```javascript
// Add permission to existing role
const rolePermissions = {
  [ROLES.AGENT]: [
    PERMISSIONS.VIEW_OWN_CONVERSATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_FORMS, // NEW PERMISSION
  ]
};
```

## 🚨 Important Notes

### 1. **Admin Account**
- Default admin: admin@chatbot.com (password: admin123)
- **CHANGE THIS PASSWORD IMMEDIATELY** in production
- Create dedicated admin accounts

### 2. **Role Indicator**
- Dev mode shows role badge in bottom-right
- Remove in production by commenting out `roleIndicator` in App.jsx

### 3. **Navigation Prop**
- CleanModernNavigation must accept `navigation` prop
- If navigation isn't filtered, check prop passing

### 4. **Widget Component**
- Regular users see simplified button interface
- Admin/Developer see full code editor
- Based on `VIEW_WIDGET_CODE` permission

## 🔄 Rollback Plan

If issues occur:

```powershell
# Restore original App.jsx
copy src\App.jsx.backup src\App.jsx -Force

# Deploy
git add .
git commit -m "Rollback RBAC temporarily"
git push origin main
vercel --prod
```

## 📋 Migration Checklist

- [ ] Backup current files
- [ ] Copy rbacService.js to src/services/
- [ ] Copy WidgetStudioSimplified.jsx to src/components/
- [ ] Replace App.jsx with App.jsx.rbac
- [ ] Update CleanModernNavigation to accept navigation prop
- [ ] Update Widget import in App.jsx
- [ ] Test locally with different roles
- [ ] Change default admin password
- [ ] Deploy to production
- [ ] Test in production
- [ ] Remove role indicator badge
- [ ] Monitor for issues

## 🎯 Success Criteria

✅ RBAC is working when:
1. Admin sees ALL features (including Webhooks, Security, Integrations)
2. Regular users DON'T see admin-only features
3. Widget page shows button (not code) for regular users
4. Navigation is filtered based on role
5. Role badge shows correct role (dev mode)
6. No console errors
7. All features work for authorized roles

## 💡 Tips

### For Admins:
- Create role-specific accounts for testing
- Review permissions regularly
- Use Developer role for technical staff
- Keep audit logs of role changes

### For Developers:
- Test with multiple role accounts
- Check console for RBAC errors
- Use browser dev tools to verify
- Document custom permissions

### For Users:
- Contact admin for access requests
- Use simplified widget button
- Focus on assigned tasks
- Report missing features to admin

---

**Your platform now has enterprise-grade role-based access control!**

Questions? Review the code in:
- `src/services/rbacService.js` - Core RBAC logic
- `src/App.jsx.rbac` - Application integration
- `src/components/WidgetStudioSimplified.jsx` - Simplified widget view
