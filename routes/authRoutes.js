const express = require('express');
const router = express.Router();
const { getMe, checkAuth} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// The route the frontend Axios call hits
router.get('/me', protect, getMe);
router.get('/check-auth', protect, checkAuth);

module.exports = router;