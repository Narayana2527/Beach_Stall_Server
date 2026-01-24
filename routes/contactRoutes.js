const express = require('express');
const router = express.Router();
const { submitContactForm, getInquiries } = require('../controllers/contactController');

// Guest route
router.post('/contact', submitContactForm);

// You can add admin-only protection here later
router.get('/contact/all', getInquiries);

module.exports = router;