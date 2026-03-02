import sql from '../postgre.js';

// Get all orders for a user (with items)
export const getOrdersByUserId = async (userId) => {
    const orders = await sql`
        SELECT o.id, o.status, o.total, o.created_at,
               o.address_snapshot,
               o.payment_method,
               o.payment_details,
               o.coupon_code,
               o.discount,
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
        JOIN   order_items oi ON oi.order_id = o.id
        WHERE  o.user_id = ${userId}
        GROUP  BY o.id
        ORDER  BY o.created_at DESC
    `;
    return orders;
};

// Create a full order with items in one transaction
export const createOrder = async (userId, { items, total, addressSnapshot, paymentMethod, paymentDetails, couponCode, discount }) => {
    const result = await sql.begin(async (sql) => {
        const [order] = await sql`
            INSERT INTO orders
                (user_id, status, total, address_snapshot, payment_method, payment_details, coupon_code, discount)
            VALUES
                (${userId}, 'Placed', ${total}, ${sql.json(addressSnapshot || {})},
                 ${paymentMethod || 'cod'}, ${sql.json(paymentDetails || {})},
                 ${couponCode || null}, ${discount || 0})
            RETURNING id, status, total, created_at, address_snapshot,
                      payment_method, payment_details, coupon_code, discount
        `;
        if (items.length > 0) {
            await sql`
                INSERT INTO order_items ${sql(
                items.map(item => ({
                    order_id: order.id,
                    product_name: item.name,
                    product_image: item.image || '',
                    price: item.price,
                    quantity: item.quantity || 1,
                }))
            )}
            `;
        }
        return order;
    });
    return result;
};

// Cancel an order (only if status is 'Placed')
export const cancelOrder = async (userId, orderId) => {
    const [updated] = await sql`
        UPDATE orders
        SET    status = 'Cancelled'
        WHERE  id = ${orderId} AND user_id = ${userId} AND status = 'Placed'
        RETURNING *
    `;
    return updated;
};
