import { Router } from 'express';
import {
    requireAdmin,
    getDashboardStats,
    getProducts, createProduct, updateProduct, deleteProduct,
    getAllOrders, updateOrderStatus,
} from '../controllers/adminController.js';

const router = Router();

// All routes require admin secret
router.use(requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
