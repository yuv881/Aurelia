-- ============================================================
-- Migration: Create user_addresses table
-- Run this in your Supabase SQL editor (or any Postgres client)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_addresses (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL DEFAULT 'Home',        -- e.g. Home / Office / Other
    full_name   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    street      TEXT NOT NULL,
    city        TEXT NOT NULL,
    state       TEXT NOT NULL,
    pincode     TEXT NOT NULL,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses (user_id);
