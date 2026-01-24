const Contact = require('../model/Contact');
const Notification = require('../model/Notification');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    // 1. Create the inquiry
    const inquiry = await Contact.create({ name, email, subject, message });

    // 2. Create Notification - Now using the 'inquiry' variable
    try {
      await Notification.create({
        title: `Inquiry: ${name}`,
        message: `Email: ${email} | Subject: ${subject || 'General'} | Message: ${message.substring(0, 100)}...`,
        type: 'contact',
        // USE CASE: Linking the notification to the actual data record
        sourceId: inquiry._id, 
        isRead: false
      });
    } catch (err) {
      console.error('Notification Log Failed:', err);
    }

    // 3. Response - Returning 'inquiry' so the frontend can confirm receipt of specific data
    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully!',
      data: inquiry // Now the variable is used here
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};