const BookingModel = require('../model/Booking');
const UserModel = require('../model/userModel'); 

module.exports = {
  userBooking: async (req, res) => {
    try {
      // Destructure the new fields sent from the React Frontend
      const { 
        phone, 
        eventDate, 
        guests, 
        category, 
        speciality, 
         
        customNotes 
      } = req.body;

      // 1. Verify User
      const user = await UserModel.findById(req.user);
      if (!user) {
        return res.status(404).json({ message: "Account verification failed." });
      }

      // 2. Create New Booking Record
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

      // 3. Save to MongoDB
      await newBooking.save();

      res.status(201).json({ 
        success: true, 
        message: "Your seashore reservation has been confirmed!",
        booking: newBooking 
      });

    } catch (err) {
      console.error("Booking Error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
};