const Contact = require('../model/Contact');
const Notification = require('../model/Notification');
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Basic Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    const inquiry = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // 3. Response
    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Your inquiry has been sent successfully!'
    });

  } catch (error) {
    console.error('Contact Controller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Could not send message'
    });
  }
};
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort('-createdAt');
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};