-- Migration to add missing input column to outputs table
-- This is safe to run multiple times (IF NOT EXISTS)

ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input jsonb;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'outputs' AND column_name = 'input';
