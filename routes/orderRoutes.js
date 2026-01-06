const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders,updateOrderStatus,getAllOrders,cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Change these to match your orderService calls
router.get('/myorders', protect, getMyOrders);
router.post('/create', protect, createOrder);
router.put('/:id/cancel', protect, cancelOrder)
router.get('/allorders',  getAllOrders);
router.put('/:id/status',  updateOrderStatus);

module.exports = router;