import express from 'express';
import { getOrders, placeOrder, cancelOrderHandler } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);                     // GET   /api/orders
router.post('/', placeOrder);                   // POST  /api/orders
router.patch('/:id/cancel', cancelOrderHandler); // PATCH /api/orders/:id/cancel

export default router;
