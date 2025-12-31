const BookingModel = require('../model/Booking')
const dotenv = require('dotenv');
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs') 

dotenv.config()

module.exports={
    userBooking:async(req, res)=>{
        try {
            const { eventDate, category } = req.body;
            
            const newBooking = new BookingModel({
                userId: req.user,
                eventDate, // Received as "2023-12-25T14:30:00.000Z"
                category
            });

            await newBooking.save();
            res.status(201).json({ message: "Booking saved successfully", newBooking });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}