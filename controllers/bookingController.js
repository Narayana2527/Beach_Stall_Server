const BookingModel = require('../model/Booking');
const UserModel = require('../model/userModel'); 
const Notification = require('../model/Notification');

module.exports = {
  userBooking: async (req, res) => {
    try {
      const { phone, eventDate, guests, category, speciality, customNotes } = req.body;

      const user = await UserModel.findById(req.user);
      if (!user) return res.status(404).json({ message: "Account verification failed." });

      const newBooking = new BookingModel({
        userId: req.user,
        userName: user.name, 
        email: user.email,   
        phone,
        eventDate,
        guests,
        category,
        speciality,
        customNotes: customNotes || ''
      });

      await newBooking.save();

      // Create Notification with detailed message
      try {
        await Notification.create({
          title: `New Booking: ${user.name}`,
          message: `Phone: ${phone} | Guests: ${guests} | Event: ${category} (${speciality}) | Notes: ${customNotes || 'None'}`,
          type: 'booking',
          isRead: false
        });
      } catch (err) {
        console.error("Notification Log Failed:", err);
      }

      res.status(201).json({ success: true, message: "Reservation confirmed!", booking: newBooking });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
};