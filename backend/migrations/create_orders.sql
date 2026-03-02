-- ============================================================
-- Migration: Create orders + order_items tables
-- Run: node backend/migrate.js   (migrate.js handles this)
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status           TEXT NOT NULL DEFAULT 'Placed',  -- Placed | Processing | Shipped | Delivered | Cancelled
    total            NUMERIC(10, 2) NOT NULL,
    address_snapshot JSONB,                            -- snapshot of delivery address at time of order
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_name  TEXT NOT NULL,
    product_image TEXT NOT NULL DEFAULT '',
    price         NUMERIC(10, 2) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders      (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
