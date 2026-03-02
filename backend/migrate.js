// Run with: node backend/migrate.js
// Creates all tables needed: user_addresses, orders, order_items
// Also adds payment columns to existing orders table

import postgres from 'postgres';
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
    try {
        // ── user_addresses ─────────────────────────────────────────
        console.log('→ Creating user_addresses table...');
        await sql`
            CREATE TABLE IF NOT EXISTS user_addresses (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type        TEXT NOT NULL DEFAULT 'Home',
                full_name   TEXT NOT NULL,
                phone       TEXT NOT NULL,
                street      TEXT NOT NULL,
                city        TEXT NOT NULL,
                state       TEXT NOT NULL,
                pincode     TEXT NOT NULL,
                is_default  BOOLEAN NOT NULL DEFAULT FALSE,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses (user_id)`;
        console.log('  ✅ user_addresses ready.');

        // ── orders ──────────────────────────────────────────────────
        console.log('→ Creating orders table...');
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id               SERIAL PRIMARY KEY,
                user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status           TEXT NOT NULL DEFAULT 'Placed',
                total            NUMERIC(10, 2) NOT NULL,
                address_snapshot JSONB,
                payment_method   TEXT NOT NULL DEFAULT 'cod',
                payment_details  JSONB,
                coupon_code      TEXT,
                discount         NUMERIC(10, 2) NOT NULL DEFAULT 0,
                created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)`;
        console.log('  ✅ orders ready.');

        // ── Add payment columns to existing orders table (idempotent) ──
        console.log('→ Adding payment columns to orders if missing...');
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  TEXT NOT NULL DEFAULT 'cod'`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details  JSONB`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code      TEXT`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount         NUMERIC(10,2) NOT NULL DEFAULT 0`;
        console.log('  ✅ Payment columns ready.');

        // ── order_items ─────────────────────────────────────────────
        console.log('→ Creating order_items table...');
        await sql`
            CREATE TABLE IF NOT EXISTS order_items (
                id            SERIAL PRIMARY KEY,
                order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_name  TEXT NOT NULL,
                product_image TEXT NOT NULL DEFAULT '',
                price         NUMERIC(10, 2) NOT NULL,
                quantity      INTEGER NOT NULL DEFAULT 1
            )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id)`;
        console.log('  ✅ order_items ready.');

        console.log('\n🎉 All migrations complete!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await sql.end();
    }
}

migrate();
