const BookingModel = require('../model/Booking');
const UserModel = require('../model/userModel'); 

module.exports = {
  userBooking: async (req, res) => {
    try {
      const { phone, eventDate, category, details } = req.body;

      const user = await UserModel.findById(req.user);
      if (!user) {
        return res.status(404).json({ message: "Account verification failed." });
      }
      const newBooking = new BookingModel({
        userId: req.user,
        userName: user.name, 
        email: user.email,   
        phone,
        eventDate,
        category,
        details: {
          subCategory: details.subCategory || '',
          nestedOption: details.nestedOption || '',
          customNotes: details.customNotes || ''
        }
      });

      await newBooking.save();

      res.status(201).json({ 
        success: true, 
        message: "Your reservation has been confirmed!",
        booking: newBooking 
      });

    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
};