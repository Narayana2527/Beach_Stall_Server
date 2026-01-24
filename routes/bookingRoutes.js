const express = require('express')
const router = express.Router();
const {userBooking,getAllBookings} = require('../controllers/bookingController')
const {protect} = require('../middleware/authMiddleware')

router.post('/bookings',protect,userBooking);
router.get('/bookings/all', protect, getAllBookings);

module.exports = router;