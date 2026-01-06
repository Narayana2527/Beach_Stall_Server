const User = require('../model/userModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

module.exports = {
  userRegister: async (req, res) => {
  try {
    const { name, email, password, confirmPassword, terms, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!terms) {
      return res.status(400).json({ message: "You must agree to terms" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      terms
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}
,

  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          token: generateToken(user.id),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email.toLowerCase().trim();
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User with this email doesn't exist." });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // THE LINK: This points to your React Frontend Route
      const resetURL = `http://localhost:5173/resetpassword/${resetToken}`; 
      // Change localhost to your actual deployed frontend URL later

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>You requested to reset your password for The Beach Stall.</p>
          <p>Please click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetURL}" style="background:#4f46e5; color:white; padding:12px 20px; text-decoration:none; border-radius:8px; display:inline-block;">Reset Password</a>
          <p style="margin-top:20px; font-size:12px; color:#888;">If you didn't request this, please ignore this email.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Password Reset Link - The Beach Stall',
          html: htmlContent,
        });

        res.status(200).json({ message: "Email sent successfully!" });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(500).json({ message: "Error sending email. Try again later." });
      }

    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) return res.status(400).json({ message: "Invalid or expired link." });

      // Hash new password and clear reset fields
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password updated successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error updating password." });
    }
  },
  getUserProfile: async (req, res) => {
    const userId = req.params.id;

    try {
      const user = await User.findById(userId).select("-password"); // hide password
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  getProfile: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      if (users) {
        res.json(users);
      } else {
        res.status(404).json({ message: "Users not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};
