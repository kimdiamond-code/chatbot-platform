-- ===================================================================
-- SECURITY TABLES - SIMPLE VERSION (if UUID extensions fail)
-- Use this if the main SQL file gives UUID errors
-- ===================================================================

-- ===================================================================
-- AUDIT LOGS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    organization_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details TEXT DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    level VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);

-- ===================================================================
-- ENCRYPTED FIELDS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS encrypted_fields (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, field_name)
);

CREATE INDEX IF NOT EXISTS idx_encrypted_fields_table ON encrypted_fields(table_name);

INSERT INTO encrypted_fields (table_name, field_name) VALUES
    ('conversations', 'customer_email'),
    ('conversations', 'customer_phone'),
    ('conversations', 'customer_name')
ON CONFLICT (table_name, field_name) DO NOTHING;

-- ===================================================================
-- SECURITY EVENTS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT 'audit_logs' as table_name, COUNT(*) as row_count FROM audit_logs
UNION ALL
SELECT 'encrypted_fields', COUNT(*) FROM encrypted_fields
UNION ALL
SELECT 'security_events', COUNT(*) FROM security_events;
