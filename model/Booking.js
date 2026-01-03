const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventDate: { type: Date, required: true },
  category: {
    type: String,
    enum: ['Wedding', 'Photography', 'Table Booking'],
    required: true
  },
  details: {
    subCategory: { type: String }, 
    nestedOption: { type: String }, 
    customNotes: { type: String }   
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);