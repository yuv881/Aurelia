import sql from '../postgre.js';

// ─── Products ────────────────────────────────────────────────

export const adminGetAllProducts = async () => {
    return await sql`SELECT * FROM products ORDER BY id DESC`;
};

export const adminUpdateProduct = async (id, fields) => {
    const { name, category, price, stock, rating, brand, image, description } = fields;
    const [updated] = await sql`
        UPDATE products SET
            name        = ${name},
            category    = ${category},
            price       = ${price},
            stock       = ${stock},
            rating      = ${rating},
            brand       = ${brand},
            image       = ${image},
            description = ${description}
        WHERE id = ${id}
        RETURNING *
    `;
    return updated;
};

export const adminDeleteProduct = async (id) => {
    const [deleted] = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
    return deleted;
};

export const adminCreateProduct = async (fields) => {
    const { name, category, price, stock, rating, brand, image, description } = fields;
    const [created] = await sql`
        INSERT INTO products (name, category, price, stock, rating, brand, image, description)
        VALUES (${name}, ${category}, ${price}, ${stock}, ${rating || 0}, ${brand}, ${image || ''}, ${description || ''})
        RETURNING *
    `;
    return created;
};

// ─── Orders ─────────────────────────────────────────────────

export const adminGetAllOrders = async () => {
    return await sql`
        SELECT o.id, o.status, o.total, o.created_at,
               o.payment_method, o.payment_details, o.coupon_code, o.discount,
               o.address_snapshot,
               u.name  AS customer_name,
               u.email AS customer_email,
               json_agg(
                   json_build_object(
                       'id',       oi.id,
                       'name',     oi.product_name,
                       'image',    oi.product_image,
                       'price',    oi.price,
                       'quantity', oi.quantity
                   ) ORDER BY oi.id
               ) AS items
        FROM   orders o
        JOIN   users u  ON u.id = o.user_id
        JOIN   order_items oi ON oi.order_id = o.id
        GROUP  BY o.id, u.id
        ORDER  BY o.created_at DESC
    `;
};

export const adminUpdateOrderStatus = async (orderId, status) => {
    const VALID = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!VALID.includes(status)) throw new Error('Invalid status');
    const [updated] = await sql`
        UPDATE orders SET status = ${status}
        WHERE  id = ${orderId}
        RETURNING *
    `;
    return updated;
};

// ─── Dashboard stats ─────────────────────────────────────────

export const adminGetStats = async () => {
    const [stats] = await sql`
        SELECT
            (SELECT COUNT(*) FROM orders)                          AS total_orders,
            (SELECT COUNT(*) FROM orders WHERE status = 'Placed')  AS pending_orders,
            (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'Cancelled') AS total_revenue,
            (SELECT COUNT(*) FROM users)                           AS total_customers,
            (SELECT COUNT(*) FROM products)                        AS total_products,
            (SELECT COUNT(*) FROM products WHERE stock = 0)        AS out_of_stock
    `;
    return stats;
};
