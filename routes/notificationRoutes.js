const express = require('express');
const router = express.Router();
const Notification = require('../model/Notification');
const { protect } = require('../middleware/authMiddleware');

// 1. GET Latest 10 (For the Header Dropdown)
router.get('/notify', protect, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// 2. GET All Notifications (For the "View All" Page)
router.get('/all', protect, async (req, res) => {
  try {
    // Fetches everything without a limit
    const notifications = await Notification.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch all notifications" });
  }
});

// 3. PUT Mark all as read (Optional but recommended)
router.put('/mark-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

module.exports = router;