// model/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,     // e.g., "New Booking"
  message: String,   // e.g., "Terry Franci booked a room"
  type: String,      // "booking" or "contact"
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);