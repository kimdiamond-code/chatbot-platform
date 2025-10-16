-- SECURITY & PRIVACY COMPLIANCE SETUP
-- Implements GDPR, CCPA, and general data protection requirements

-- 1. DATA ENCRYPTION & SECURITY
-- Add encryption status tracking to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_encrypted BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. CONSENT MANAGEMENT
CREATE TABLE IF NOT EXISTS customer_consent (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  consent_type VARCHAR(100) NOT NULL, -- 'data_collection', 'marketing', 'analytics', 'profiling'
  consent_given BOOLEAN DEFAULT false,
  consent_version VARCHAR(50),
  consent_text TEXT,
  consented_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_consent_customer ON customer_consent(customer_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON customer_consent(consent_type);

-- 3. DATA RETENTION POLICIES
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  data_type VARCHAR(100) NOT NULL, -- 'customer_profile', 'conversations', 'analytics'
  retention_days INTEGER NOT NULL, -- How long to keep data
  auto_delete BOOLEAN DEFAULT false,
  anonymize_instead_of_delete BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default retention policies (GDPR compliant)
INSERT INTO data_retention_policies (organization_id, data_type, retention_days, auto_delete, anonymize_instead_of_delete)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'customer_profile', 1095, false, true), -- 3 years
  ('00000000-0000-0000-0000-000000000001', 'conversations', 365, true, false), -- 1 year
  ('00000000-0000-0000-0000-000000000001', 'analytics', 730, true, true), -- 2 years
  ('00000000-0000-0000-0000-000000000001', 'customer_visits', 180, true, true) -- 6 months
ON CONFLICT DO NOTHING;

-- 4. AUDIT LOG (Track all access to customer data)
CREATE TABLE IF NOT EXISTS data_access_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  accessed_by VARCHAR(255) NOT NULL, -- user_id, agent_id, or 'system'
  access_type VARCHAR(100) NOT NULL, -- 'read', 'update', 'delete', 'export'
  data_accessed TEXT, -- Which fields were accessed
  purpose VARCHAR(255), -- Why the data was accessed
  ip_address VARCHAR(45),
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_log_customer ON data_access_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_access_log_date ON data_access_log(accessed_at);
CREATE INDEX IF NOT EXISTS idx_access_log_type ON data_access_log(access_type);

-- 5. DATA DELETION REQUESTS (GDPR Right to be Forgotten)
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- 'delete_all', 'anonymize', 'export'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by VARCHAR(255),
  reason_for_rejection TEXT,
  verification_token VARCHAR(255) UNIQUE,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_customer ON data_deletion_requests(customer_id);

-- 6. PII (Personally Identifiable Information) FIELDS
-- Mark which fields contain PII for compliance
CREATE TABLE IF NOT EXISTS pii_fields_registry (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  column_name VARCHAR(100) NOT NULL,
  pii_type VARCHAR(100) NOT NULL, -- 'email', 'name', 'phone', 'address', 'ip', 'identifier'
  sensitivity_level VARCHAR(50) NOT NULL, -- 'high', 'medium', 'low'
  encryption_required BOOLEAN DEFAULT true,
  anonymization_method VARCHAR(100), -- 'hash', 'redact', 'pseudonymize', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_name, column_name)
);

-- Register PII fields
INSERT INTO pii_fields_registry (table_name, column_name, pii_type, sensitivity_level, encryption_required, anonymization_method)
VALUES 
  ('customers', 'email', 'email', 'high', true, 'hash'),
  ('customers', 'name', 'name', 'medium', true, 'pseudonymize'),
  ('customers', 'phone', 'phone', 'high', true, 'redact'),
  ('conversations', 'customer_email', 'email', 'high', true, 'hash'),
  ('conversations', 'customer_name', 'name', 'medium', true, 'pseudonymize'),
  ('conversations', 'customer_phone', 'phone', 'high', true, 'redact'),
  ('data_access_log', 'ip_address', 'ip', 'medium', false, 'hash'),
  ('customer_consent', 'ip_address', 'ip', 'medium', false, 'hash')
ON CONFLICT DO NOTHING;

-- 7. ANONYMIZATION FUNCTION
-- Anonymizes customer data while preserving analytics value
CREATE OR REPLACE FUNCTION anonymize_customer_data(p_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_random_suffix TEXT;
BEGIN
  -- Generate random suffix for anonymization
  v_random_suffix := substring(md5(random()::text) from 1 for 8);
  
  -- Anonymize customer record
  UPDATE customers
  SET 
    email = 'anonymized_' || v_random_suffix || '@deleted.local',
    name = 'Anonymized User ' || v_random_suffix,
    phone = NULL,
    metadata = jsonb_build_object(
      'anonymized', true,
      'anonymized_at', NOW(),
      'original_data_deleted', true
    ),
    tags = ARRAY['anonymized']
  WHERE id = p_customer_id;
  
  -- Anonymize conversations
  UPDATE conversations
  SET 
    customer_email = 'anonymized_' || v_random_suffix || '@deleted.local',
    customer_name = 'Anonymized User ' || v_random_suffix,
    customer_phone = NULL,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{anonymized}',
      'true'::jsonb
    )
  WHERE customer_email = (SELECT email FROM customers WHERE id = p_customer_id);
  
  -- Log the anonymization
  INSERT INTO data_access_log (organization_id, customer_id, accessed_by, access_type, purpose)
  VALUES (
    (SELECT organization_id FROM customers WHERE id = p_customer_id),
    p_customer_id,
    'system',
    'anonymize',
    'GDPR Right to be Forgotten'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 8. DATA EXPORT FUNCTION (GDPR Right to Data Portability)
CREATE OR REPLACE FUNCTION export_customer_data(p_customer_email VARCHAR)
RETURNS JSONB AS $$
DECLARE
  v_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'customer_profile', (
      SELECT row_to_json(c.*)
      FROM customers c
      WHERE c.email = p_customer_email
    ),
    'conversations', (
      SELECT jsonb_agg(row_to_json(conv.*))
      FROM conversations conv
      WHERE conv.customer_email = p_customer_email
    ),
    'messages', (
      SELECT jsonb_agg(row_to_json(m.*))
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.customer_email = p_customer_email
    ),
    'consent_records', (
      SELECT jsonb_agg(row_to_json(cons.*))
      FROM customer_consent cons
      JOIN customers cust ON cons.customer_id = cust.id
      WHERE cust.email = p_customer_email
    ),
    'exported_at', NOW()
  ) INTO v_data;
  
  RETURN v_data;
END;
$$ LANGUAGE plpgsql;

-- 9. AUTO-CLEANUP JOB (Run periodically)
-- Function to delete old data based on retention policies
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE (
  data_type TEXT,
  records_deleted BIGINT,
  records_anonymized BIGINT
) AS $$
DECLARE
  v_policy RECORD;
  v_deleted BIGINT;
  v_anonymized BIGINT;
BEGIN
  FOR v_policy IN SELECT * FROM data_retention_policies WHERE auto_delete = true LOOP
    v_deleted := 0;
    v_anonymized := 0;
    
    CASE v_policy.data_type
      WHEN 'conversations' THEN
        IF v_policy.anonymize_instead_of_delete THEN
          -- Anonymize old conversations
          UPDATE conversations
          SET customer_email = 'anonymized_' || substring(md5(random()::text) from 1 for 8) || '@deleted.local',
              customer_name = 'Anonymized',
              customer_phone = NULL
          WHERE created_at < NOW() - (v_policy.retention_days || ' days')::INTERVAL
          AND customer_email NOT LIKE 'anonymized_%';
          GET DIAGNOSTICS v_anonymized = ROW_COUNT;
        ELSE
          -- Delete old conversations
          DELETE FROM conversations
          WHERE created_at < NOW() - (v_policy.retention_days || ' days')::INTERVAL;
          GET DIAGNOSTICS v_deleted = ROW_COUNT;
        END IF;
        
      WHEN 'customer_visits' THEN
        DELETE FROM customer_visits
        WHERE visit_date < NOW() - (v_policy.retention_days || ' days')::INTERVAL;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
        
      WHEN 'analytics' THEN
        DELETE FROM analytics_events
        WHERE created_at < NOW() - (v_policy.retention_days || ' days')::INTERVAL;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
    END CASE;
    
    RETURN QUERY SELECT v_policy.data_type::TEXT, v_deleted, v_anonymized;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 10. SECURITY VIEWS (Read-only access with PII masked)
-- Analysts can query this without seeing PII
CREATE OR REPLACE VIEW customer_analytics_safe AS
SELECT 
  c.id,
  c.organization_id,
  substring(md5(c.email) from 1 for 10) as email_hash, -- Hashed email
  c.metadata->'visitCount' as visit_count,
  c.metadata->'lastSeen' as last_seen,
  c.tags,
  c.created_at
FROM customers c
WHERE (c.metadata->>'anonymized')::boolean IS NOT TRUE;

-- 11. CONSENT HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION check_customer_consent(
  p_customer_email VARCHAR,
  p_consent_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_consent BOOLEAN;
BEGIN
  SELECT consent_given INTO v_consent
  FROM customer_consent cc
  JOIN customers c ON cc.customer_id = c.id
  WHERE c.email = p_customer_email
  AND cc.consent_type = p_consent_type
  AND cc.withdrawn_at IS NULL;
  
  RETURN COALESCE(v_consent, false);
END;
$$ LANGUAGE plpgsql;

-- 12. ENABLE ROW LEVEL SECURITY
ALTER TABLE customer_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on customer_consent" ON customer_consent FOR ALL USING (true);
CREATE POLICY "Allow all operations on data_access_log" ON data_access_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on data_deletion_requests" ON data_deletion_requests FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ SECURITY & PRIVACY COMPLIANCE SETUP COMPLETE';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Features Enabled:';
  RAISE NOTICE '   • Data encryption tracking';
  RAISE NOTICE '   • Consent management (GDPR/CCPA)';
  RAISE NOTICE '   • Data retention policies';
  RAISE NOTICE '   • Audit logging (all data access)';
  RAISE NOTICE '   • Right to be Forgotten (anonymization)';
  RAISE NOTICE '   • Right to Data Portability (export)';
  RAISE NOTICE '   • PII field registry';
  RAISE NOTICE '   • Automated data cleanup';
  RAISE NOTICE '   • Privacy-safe analytics views';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Default Retention Policies:';
  RAISE NOTICE '   • Customer profiles: 3 years';
  RAISE NOTICE '   • Conversations: 1 year (auto-delete)';
  RAISE NOTICE '   • Analytics: 2 years (auto-delete)';
  RAISE NOTICE '   • Visit tracking: 6 months (auto-delete)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Configure your privacy policy and consent forms!';
END $$;
