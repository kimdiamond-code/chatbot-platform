// Privacy & Compliance Service
// Handles GDPR, CCPA, and data protection requirements

class PrivacyComplianceService {
  constructor() {
    this.consentVersion = '1.0';
  }

  /**
   * Record customer consent
   */
  async recordConsent(customerId, organizationId, consentType, consented, ipAddress, userAgent) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'privacy',
          action: 'recordConsent',
          customerId,
          organizationId,
          consentType,
          consented,
          consentVersion: this.consentVersion,
          ipAddress,
          userAgent
        })
      });

      const result = await response.json();
      console.log('✅ Consent recorded:', consentType, consented);
      return result.success;
    } catch (error) {
      console.error('❌ Error recording consent:', error);
      return false;
    }
  }

  /**
   * Check if customer has given consent
   */
  async checkConsent(customerEmail, organizationId, consentType) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'privacy',
          action: 'checkConsent',
          customerEmail,
          organizationId,
          consentType
        })
      });

      const result = await response.json();
      return result.success && result.hasConsent;
    } catch (error) {
      console.error('❌ Error checking consent:', error);
      return false;
    }
  }

  /**
   * Request data deletion (GDPR Right to be Forgotten)
   */
  async requestDataDeletion(customerEmail, organizationId, requestType = 'anonymize') {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'privacy',
          action: 'requestDeletion',
          customerEmail,
          organizationId,
          requestType // 'delete_all' or 'anonymize'
        })
      });

      const result = await response.json();
      console.log('✅ Data deletion requested:', customerEmail);
      return result;
    } catch (error) {
      console.error('❌ Error requesting deletion:', error);
      throw error;
    }
  }

  /**
   * Export customer data (GDPR Right to Data Portability)
   */
  async exportCustomerData(customerEmail, organizationId) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'privacy',
          action: 'exportData',
          customerEmail,
          organizationId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Download as JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customer-data-${customerEmail}-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Customer data exported:', customerEmail);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Log data access (audit trail)
   */
  async logDataAccess(customerEmail, accessType, dataAccessed, purpose, accessedBy = 'system') {
    try {
      await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'privacy',
          action: 'logAccess',
          customerEmail,
          accessType, // 'read', 'update', 'delete', 'export'
          dataAccessed,
          purpose,
          accessedBy
        })
      });
    } catch (error) {
      console.error('⚠️ Failed to log data access:', error);
      // Don't throw - logging failure shouldn't break functionality
    }
  }

  /**
   * Get consent requirements (what user needs to consent to)
   */
  getConsentRequirements() {
    return [
      {
        type: 'data_collection',
        required: true,
        title: 'Data Collection',
        description: 'We collect your email, name, and conversation history to provide customer support.'
      },
      {
        type: 'analytics',
        required: false,
        title: 'Analytics',
        description: 'We use analytics to improve our service. You can opt out anytime.'
      },
      {
        type: 'marketing',
        required: false,
        title: 'Marketing Communications',
        description: 'Receive updates about products and special offers.'
      },
      {
        type: 'profiling',
        required: false,
        title: 'Personalization',
        description: 'Allow us to personalize your experience based on your preferences.'
      }
    ];
  }

  /**
   * Anonymize PII in text (for logging)
   */
  anonymizePII(text) {
    if (!text) return text;

    // Anonymize emails
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
    
    // Anonymize phone numbers
    text = text.replace(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g, '[PHONE]');
    
    // Anonymize credit cards (basic pattern)
    text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CREDIT_CARD]');
    
    return text;
  }

  /**
   * Check if data should be retained
   */
  shouldRetainData(dataType, createdAt) {
    const retentionDays = {
      'customer_profile': 1095, // 3 years
      'conversations': 365,     // 1 year
      'analytics': 730,         // 2 years
      'visits': 180            // 6 months
    };

    const days = retentionDays[dataType] || 365;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - days);

    return new Date(createdAt) > retentionDate;
  }

  /**
   * Generate privacy notice text
   */
  getPrivacyNotice() {
    return {
      title: 'Privacy Notice',
      summary: 'We respect your privacy and protect your personal data.',
      details: `
        We collect and process your personal information to:
        - Provide customer support
        - Remember your preferences
        - Improve our services
        
        Your rights:
        - Right to access your data
        - Right to correct inaccurate data
        - Right to delete your data
        - Right to data portability
        - Right to object to processing
        
        Data retention:
        - Customer profiles: 3 years from last activity
        - Conversations: 1 year
        - Analytics: 2 years (anonymized)
        
        Your data is encrypted and stored securely. We never sell your personal information.
      `,
      lastUpdated: '2025-01-15',
      version: this.consentVersion
    };
  }
}

// Export singleton
export const privacyService = new PrivacyComplianceService();
export default privacyService;
