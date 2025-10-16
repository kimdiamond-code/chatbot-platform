# SQL Migration Guide

## Which SQL File to Use?

### Option 1: Try This First
**File**: `add_security_tables.sql`

This uses UUID for primary keys (recommended).

**In Neon SQL Editor, paste and run:**
```sql
-- Copy entire contents of add_security_tables.sql
```

✅ If no errors → You're done!  
❌ If you see "UUID" errors → Use Option 2

---

### Option 2: If Option 1 Fails
**File**: `add_security_tables_simple.sql`

This uses SERIAL IDs instead of UUIDs (simpler, always works).

**In Neon SQL Editor, paste and run:**
```sql
-- Copy entire contents of add_security_tables_simple.sql
```

This will definitely work!

---

## How to Run in Neon

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click "SQL Editor" in left menu
4. Copy/paste the SQL file contents
5. Click "Run" button
6. Should see: "Success" or "Query returned successfully"

---

## Verify It Worked

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'encrypted_fields', 'security_events');
```

Should return 3 rows with the table names.

---

## What If It Still Fails?

Try running these one at a time:

### Step 1: Create audit_logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    organization_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    level VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Create encrypted_fields
```sql
CREATE TABLE encrypted_fields (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, field_name)
);
```

### Step 3: Create security_events
```sql
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 4: Add indexes
```sql
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
```

---

## Common Error Messages

### "relation already exists"
✅ This is OK! It means the table was already created.
Just continue with the next steps.

### "syntax error near..."
❌ Copy the EXACT SQL from the file, including all lines.
Make sure you copied everything.

### "permission denied"
❌ You need admin access to the database.
Check your Neon project permissions.

---

## Still Having Issues?

Use this minimal version (copy all at once):

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encrypted_fields (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    field_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Tables created successfully!' as status;
```

This absolute minimum will work on any PostgreSQL database.

---

**Need help?** Share the exact error message you're seeing.
