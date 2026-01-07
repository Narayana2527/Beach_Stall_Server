const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your email provider
    auth: {
      user: process.env.nd.beachstall@gmail.com,
      pass: process.env.cvawcsinsuxfmlhq, // Your App Password (not your login pass)
    },
  });

  const mailOptions = {
    from: "The Beach Stall",
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;