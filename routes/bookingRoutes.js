const express = require('express')
const router = express.Router();
const {userBooking} = require('../controllers/bookingController')
const {protect} = require('../middleware/authMiddleware')

router.post('/bookings',protect,userBooking);


module.exports = router;