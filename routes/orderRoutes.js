const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders,updateOrderStatus,getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Change these to match your orderService calls
router.get('/myorders', protect, getMyOrders);
router.post('/create', protect, createOrder);
router.get('/allorders',  getAllOrders);
router.put('/status', protect, updateOrderStatus);

module.exports = router;