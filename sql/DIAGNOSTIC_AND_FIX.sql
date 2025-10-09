-- DIAGNOSTIC: Check current table structure and fix it
-- Run this in Supabase SQL Editor to see what's wrong

-- 1. Check if integrations table exists and its structure
SELECT 'Checking integrations table structure...' as step;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'integrations'
ORDER BY ordinal_position;

-- 2. Check current data in integrations table
SELECT 'Current data in integrations table:' as step;
SELECT * FROM integrations LIMIT 5;

-- 3. Check table permissions/RLS
SELECT 'Checking RLS status:' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'integrations';

-- 4. Check policies
SELECT 'Checking policies:' as step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'integrations';

-- 5. If table doesn't exist or is broken, recreate it properly
DO $$
BEGIN
    -- Drop and recreate table if it has issues
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'integrations' 
        AND column_name = 'credentials'
        AND data_type = 'jsonb'
    ) THEN
        -- Table is missing credentials column or has wrong type
        DROP TABLE IF EXISTS integrations CASCADE;
        
        CREATE TABLE integrations (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
            integration_id VARCHAR(50) NOT NULL,
            integration_name VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'disconnected',
            config JSONB DEFAULT '{}',
            credentials JSONB DEFAULT '{}',
            connected_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT integrations_unique UNIQUE(organization_id, integration_id)
        );
        
        -- Set up RLS and policies
        ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Enable all access for integrations" ON integrations;
        DROP POLICY IF EXISTS "Enable all for demo" ON integrations;
        
        -- Create new policy
        CREATE POLICY "integrations_full_access" ON integrations FOR ALL USING (true);
        
        -- Insert Shopify integration
        INSERT INTO integrations (
            organization_id,
            integration_id,
            integration_name,
            status,
            config,
            credentials
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            'shopify',
            'Shopify',
            'disconnected',
            '{"features": ["Product Search", "Order Tracking", "Customer Data"]}',
            '{}'
        );
        
        RAISE NOTICE 'Integrations table recreated successfully!';
    ELSE
        RAISE NOTICE 'Integrations table structure looks correct';
    END IF;
END $$;

-- 6. Final verification
SELECT 'Final verification:' as step;
SELECT 
    'integrations' as table_name,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'integrations' 
ORDER BY ordinal_position;

SELECT 'Sample data:' as step;
SELECT integration_id, integration_name, status FROM integrations;