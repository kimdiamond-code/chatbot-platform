-- Insert demo conversations and customers for testing
-- Run this after COMPLETE_DATABASE_SETUP.sql

-- Insert demo customers
INSERT INTO customers (id, organization_id, name, email, metadata) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', '{}'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Jane Smith', 'jane@example.com', '{}'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Bob Johnson', 'bob@example.com', '{}')
ON CONFLICT (id) DO NOTHING;

-- Insert demo conversations
INSERT INTO conversations (id, organization_id, customer_id, status, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '1 hour'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'waiting', NOW() - INTERVAL '2 hours'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'resolved', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert initial demo messages
INSERT INTO messages (conversation_id, content, sender_type, created_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Hello, I need help with my order', 'user', NOW() - INTERVAL '55 minutes'),
('10000000-0000-0000-0000-000000000002', 'Thank you for the quick response!', 'user', NOW() - INTERVAL '90 minutes'),
('10000000-0000-0000-0000-000000000003', 'Issue resolved, thanks!', 'user', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Demo conversations inserted successfully!';
    RAISE NOTICE '📊 3 demo customers created';
    RAISE NOTICE '💬 3 demo conversations ready';
    RAISE NOTICE '🧪 Ready to test Live Chat!';
END $$;
