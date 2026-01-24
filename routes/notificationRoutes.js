// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/Notification');
const { protect } = require('../middleware/authMiddleware');

router.get('/notify', protect, async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
  res.json(notifications);
});

module.exports = router;