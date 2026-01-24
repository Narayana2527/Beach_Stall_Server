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

    // 2. Save the Inquiry
    const inquiry = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // --- ADDED: CREATE NOTIFICATION ---
    try {
      await Notification.create({
        title: 'New Contact Inquiry',
        message: `${name} sent a message regarding: ${subject || 'No Subject'}`,
        type: 'contact',      // Helps frontend choose the icon
        sourceId: inquiry._id, // Reference to the actual inquiry
        isRead: false
      });
    } catch (notificationError) {
      // We log this but don't stop the request, 
      // so the user still gets their "Success" message.
      console.error('Notification failed to save:', notificationError);
    }
    // ----------------------------------

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