-- ============================================================
-- Migration: Add Google OAuth fields to the `users` table
-- Run this in your Supabase SQL editor (or any Postgres client)
-- ============================================================

-- 1. Add google_id column (unique, nullable — NULL for email/password users)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- 2. Add avatar URL column (populated from Google profile picture)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 3. Track how the user signed up — 'local' (default) or 'google'
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'local';

-- 4. Make password nullable so Google-only users don't need one
ALTER TABLE users
    ALTER COLUMN password DROP NOT NULL;

-- 5. Index on google_id for fast lookups during OAuth login
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);

-- ============================================================
-- Verify: inspect the updated columns
-- ============================================================
SELECT column_name, data_type, is_nullable, column_default
FROM   information_schema.columns
WHERE  table_name = 'users'
ORDER  BY ordinal_position;
