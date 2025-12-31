const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Change these to match your orderService calls
router.get('/myorders', protect, getMyOrders);
router.post('/create', protect, createOrder);

module.exports = router;