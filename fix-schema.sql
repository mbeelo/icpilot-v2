-- Add missing columns to the database schema

-- Add is_active column to icps table if it doesn't exist
ALTER TABLE icps ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add input column to outputs table if it doesn't exist
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}';

-- Update any existing outputs to have valid input data
UPDATE outputs SET input = '{}' WHERE input IS NULL;