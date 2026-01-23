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
  guests: { type: String, required: true }, // Added for table size
  category: {
    type: String,
    // Updated to match your 5 new categories
    enum: ['Veg Curry', 'Non-Veg Curry', 'Veg Biryani', 'Non-Veg Biryani', 'Catering'],
    required: true
  },
  speciality: { type: String, required: true }, // The specific dish chosen
  // seating: { type: String }, // Sea-Facing, etc.
  customNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);