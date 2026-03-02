import {
    adminGetAllProducts, adminUpdateProduct, adminDeleteProduct, adminCreateProduct,
    adminGetAllOrders, adminUpdateOrderStatus, adminGetStats
} from '../queries/adminQueries.js';

// ── Simple admin key guard ─────────────────────────────────────
// Set ADMIN_SECRET in backend/.env  —  admin app sends it as
// Authorization: Bearer <ADMIN_SECRET>
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'aurelia-admin-secret-2025';

export const requireAdmin = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${ADMIN_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized — invalid admin key' });
    }
    next();
};

// ── Dashboard ──────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminGetStats();
        res.json(stats);
    } catch (err) {
        console.error('stats error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ── Products ───────────────────────────────────────────────────
export const getProducts = async (req, res) => {
    try { res.json(await adminGetAllProducts()); }
    catch (err) { res.status(500).json({ message: err.message }); }
};

export const createProduct = async (req, res) => {
    try {
        const product = await adminCreateProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        console.error('createProduct error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await adminUpdateProduct(req.params.id, req.body);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('updateProduct error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await adminDeleteProduct(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Deleted', product });
    } catch (err) {
        console.error('deleteProduct error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ── Orders ─────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
    try { res.json(await adminGetAllOrders()); }
    catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await adminUpdateOrderStatus(req.params.id, status);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error('updateOrderStatus error:', err);
        res.status(500).json({ message: err.message });
    }
};
