// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/Notification');
const { protect } = require('../middleware/authMiddleware');

router.get('/notify', protect, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    
    // Wrap in the format the frontend expects
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    });
  }
});

module.exports = router;