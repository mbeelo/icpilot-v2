-- Fix missing columns in icps table
ALTER TABLE icps ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Fix missing columns in outputs table
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}';

-- Verify all tables have correct structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('icps', 'outputs')
AND table_schema = 'public'
ORDER BY table_name, column_name;