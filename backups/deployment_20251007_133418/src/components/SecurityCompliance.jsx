import React, { useState } from 'react';
import { Shield, Lock, Key, UserCheck, AlertTriangle, FileText, Globe, Database, Eye, Settings, CheckCircle, XCircle } from 'lucide-react';

const SecurityCompliance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [securitySettings, setSecuritySettings] = useState({
    sso: {
      enabled: true,
      provider: 'Okta',
      status: 'active'
    },
    twoFactor: {
      enabled: true,
      method: 'authenticator',
      enforcedForAdmins: true
    },
    encryption: {
      atRest: true,
      inTransit: true,
      algorithm: 'AES-256'
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90
    }
  });

  const [complianceStatus] = useState({
    gdpr: {
      compliant: true,
      lastAudit: '2024-02-15',
      nextAudit: '2024-05-15',
      items: [
        { name: 'Data Processing Agreement', status: 'complete' },
        { name: 'Privacy Policy Updated', status: 'complete' },
        { name: 'Cookie Consent Banner', status: 'complete' },
        { name: 'Right to Erasure Process', status: 'complete' },
        { name: 'Data Portability', status: 'complete' }
      ]
    },
    ccpa: {
      compliant: true,
      lastAudit: '2024-01-20',
      nextAudit: '2024-04-20',
      items: [
        { name: 'Privacy Notice', status: 'complete' },
        { name: 'Opt-Out Mechanism', status: 'complete' },
        { name: 'Data Deletion Process', status: 'complete' },
        { name: 'Do Not Sell Implementation', status: 'complete' }
      ]
    },
    hipaa: {
      compliant: false,
      lastAudit: null,
      nextAudit: null,
      items: [
        { name: 'Business Associate Agreement', status: 'pending' },
        { name: 'PHI Encryption', status: 'pending' },
        { name: 'Access Controls', status: 'in_progress' },
        { name: 'Audit Logs', status: 'complete' }
      ]
    }
  });

  const [ipRules, setIpRules] = useState([
    { id: 1, type: 'allow', ip: '192.168.1.0/24', description: 'Office Network', enabled: true },
    { id: 2, type: 'allow', ip: '10.0.0.0/16', description: 'VPN Range', enabled: true },
    { id: 3, type: 'block', ip: '185.220.101.0/24', description: 'Known Threat Actor', enabled: true },
    { id: 4, type: 'block', ip: '23.129.64.0/24', description: 'Suspicious Activity', enabled: true }
  ]);

  const [roles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      users: 2,
      permissions: ['all'],
      critical: true
    },
    {
      id: 2,
      name: 'Admin',
      users: 5,
      permissions: ['manage_users', 'manage_bots', 'view_analytics', 'manage_integrations'],
      critical: true
    },
    {
      id: 3,
      name: 'Agent',
      users: 15,
      permissions: ['chat_support', 'view_customers', 'add_notes'],
      critical: false
    },
    {
      id: 4,
      name: 'Viewer',
      users: 8,
      permissions: ['view_analytics', 'view_customers'],
      critical: false
    }
  ]);

  const [auditLogs] = useState([
    { id: 1, user: 'admin@company.com', action: 'User Login', ip: '192.168.1.100', timestamp: '2024-03-20 14:23:45', status: 'success' },
    { id: 2, user: 'sarah@company.com', action: 'Export Customer Data', ip: '192.168.1.105', timestamp: '2024-03-20 13:45:12', status: 'success' },
    { id: 3, user: 'unknown', action: 'Failed Login Attempt', ip: '185.220.101.45', timestamp: '2024-03-20 12:34:56', status: 'failed' },
    { id: 4, user: 'mike@company.com', action: 'Update Bot Configuration', ip: '10.0.0.25', timestamp: '2024-03-20 11:23:34', status: 'success' },
    { id: 5, user: 'admin@company.com', action: 'Delete Customer Record', ip: '192.168.1.100', timestamp: '2024-03-20 10:15:22', status: 'success' }
  ]);

  const [dataRetention, setDataRetention] = useState({
    chatLogs: 90,
    customerData: 365,
    analyticsData: 730,
    auditLogs: 2555,
    automaticDeletion: true
  });

  const getComplianceColor = (status) => {
    switch(status) {
      case 'complete': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'pending': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security & Compliance</h1>
        <p className="text-gray-600">Manage security settings and compliance requirements</p>
      </div>

      {/* Security Score */}
      <div className="glass-premium p-6 rounded-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Score</h2>
            <p className="text-gray-600">Based on current configuration and best practices</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600">92</div>
            <div className="text-sm text-gray-600">Excellent</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">SSO Enabled</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">2FA Active</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">Data Encrypted</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm">HIPAA Pending</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['overview', 'authentication', 'compliance', 'access_control', 'data_protection', 'audit_logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'glass-dynamic text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Status */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Status</h2>
            
            {Object.entries(complianceStatus).map(([key, value]) => (
              <div key={key} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{key.toUpperCase()}</h3>
                    {value.compliant ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Compliant
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        In Progress
                      </span>
                    )}
                  </div>
                  {value.nextAudit && (
                    <span className="text-xs text-gray-500">Next audit: {value.nextAudit}</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {value.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className={getComplianceColor(item.status)}>
                        {item.status === 'complete' ? '✓' : item.status === 'in_progress' ? '⋯' : '○'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Compliance Report</div>
                    <div className="text-sm text-gray-600">Export GDPR/CCPA compliance documentation</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Data Subject Request</div>
                    <div className="text-sm text-gray-600">Process data access/deletion requests</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Security Audit</div>
                    <div className="text-sm text-gray-600">Run automated security assessment</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Review Permissions</div>
                    <div className="text-sm text-gray-600">Audit user roles and access levels</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'authentication' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SSO Configuration */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Single Sign-On (SSO)</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">SSO Enabled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.sso.enabled}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sso: {...securitySettings.sso, enabled: e.target.checked}
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select 
                  value={securitySettings.sso.provider}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sso: {...securitySettings.sso, provider: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option>Okta</option>
                  <option>Auth0</option>
                  <option>Azure AD</option>
                  <option>Google Workspace</option>
                </select>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">SSO is active and working</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">2FA Enabled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.twoFactor.enabled}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      twoFactor: {...securitySettings.twoFactor, enabled: e.target.checked}
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                <select 
                  value={securitySettings.twoFactor.method}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    twoFactor: {...securitySettings.twoFactor, method: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="authenticator">Authenticator App</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={securitySettings.twoFactor.enforcedForAdmins}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    twoFactor: {...securitySettings.twoFactor, enforcedForAdmins: e.target.checked}
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Enforce for all admin users</span>
              </label>
              
              <div className="text-sm text-gray-600">
                <p>• 18 of 20 users have 2FA enabled</p>
                <p>• Last enforcement: 30 days ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div>
          {/* Consent Management */}
          <div className="glass-premium p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Consent Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Cookie Consent</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Show cookie banner</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Granular cookie controls</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Remember consent preferences</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Data Processing</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Explicit consent required</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Opt-in for marketing</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Right to withdraw consent</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention Policy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chat Logs (days)</label>
                <input
                  type="number"
                  value={dataRetention.chatLogs}
                  onChange={(e) => setDataRetention({...dataRetention, chatLogs: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Data (days)</label>
                <input
                  type="number"
                  value={dataRetention.customerData}
                  onChange={(e) => setDataRetention({...dataRetention, customerData: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Analytics Data (days)</label>
                <input
                  type="number"
                  value={dataRetention.analyticsData}
                  onChange={(e) => setDataRetention({...dataRetention, analyticsData: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audit Logs (days)</label>
                <input
                  type="number"
                  value={dataRetention.auditLogs}
                  onChange={(e) => setDataRetention({...dataRetention, auditLogs: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={dataRetention.automaticDeletion}
                  onChange={(e) => setDataRetention({...dataRetention, automaticDeletion: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Automatically delete data after retention period</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'access_control' && (
        <div>
          {/* IP Filtering */}
          <div className="glass-premium p-6 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">IP Filtering Rules</h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                + Add Rule
              </button>
            </div>
            
            <div className="space-y-3">
              {ipRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {rule.type === 'allow' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{rule.ip}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.type === 'allow' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {rule.type}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rule.enabled}
                        className="sr-only peer"
                        readOnly
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role-Based Access Control */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Role-Based Access Control</h2>
            
            <div className="space-y-3">
              {roles.map(role => (
                <div key={role.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-600">{role.users} users</div>
                      </div>
                    </div>
                    {role.critical && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {role.permissions.map(perm => (
                      <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data_protection' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Encryption</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Encryption Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Data at Rest</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    AES-256
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Data in Transit</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    TLS 1.3
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Database Encryption</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Backup Encryption</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Enabled
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Key Management</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Key Rotation</div>
                  <div className="text-sm text-gray-600">Every 90 days (automatic)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Key Storage</div>
                  <div className="text-sm text-gray-600">Hardware Security Module (HSM)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Last Rotation</div>
                  <div className="text-sm text-gray-600">March 1, 2024</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Next Rotation</div>
                  <div className="text-sm text-gray-600">May 30, 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit_logs' && (
        <div className="glass-premium p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Export Logs
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{log.user}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{log.action}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCompliance;