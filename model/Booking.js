const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  eventDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Wedding', 'Photography', 'Table Booking'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);