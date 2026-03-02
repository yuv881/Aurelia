import jwt from 'jsonwebtoken';
import { getUserById } from '../queries/userQueries.js';
import { getOrdersByUserId, createOrder, cancelOrder } from '../queries/orderQueries.js';

// ── JWT helper (reused pattern) ───────────────────────────────
const extractUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized — no token' });
        return null;
    }
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret_key');
        const user = await getUserById(decoded.id);
        if (!user) { res.status(401).json({ message: 'User not found' }); return null; }
        return user;
    } catch {
        res.status(401).json({ message: 'Invalid token' });
        return null;
    }
};

// GET /api/orders
export const getOrders = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;
    try {
        const orders = await getOrdersByUserId(user.id);
        res.status(200).json(orders);
    } catch (err) {
        console.error('getOrders error:', err);
        res.status(500).json({ message: err?.message || 'Error fetching orders' });
    }
};

// POST /api/orders  — place a new order
export const placeOrder = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;

    const { items, total, addressSnapshot, paymentMethod, paymentDetails, couponCode, discount } = req.body;
    if (!items?.length || !total) {
        return res.status(400).json({ message: 'items and total are required' });
    }

    // Safety: never trust raw card details — only accept masked/safe summary
    const safePaymentDetails = (() => {
        if (!paymentDetails) return {};
        const { method, lastFour, cardholderName, upiId, provider } = paymentDetails;
        return { method, lastFour, cardholderName, upiId, provider }; // strip any raw numbers/CVV
    })();

    try {
        const order = await createOrder(user.id, {
            items,
            total,
            addressSnapshot,
            paymentMethod: paymentMethod || 'cod',
            paymentDetails: safePaymentDetails,
            couponCode: couponCode || null,
            discount: discount || 0,
        });
        res.status(201).json(order);
    } catch (err) {
        console.error('placeOrder error:', err);
        res.status(500).json({ message: err?.message || 'Error placing order' });
    }
};


// PATCH /api/orders/:id/cancel
export const cancelOrderHandler = async (req, res) => {
    const user = await extractUser(req, res);
    if (!user) return;
    try {
        const updated = await cancelOrder(user.id, req.params.id);
        if (!updated) return res.status(400).json({ message: 'Order cannot be cancelled (already processed or not found)' });
        res.status(200).json(updated);
    } catch (err) {
        console.error('cancelOrder error:', err);
        res.status(500).json({ message: err?.message || 'Error cancelling order' });
    }
};
