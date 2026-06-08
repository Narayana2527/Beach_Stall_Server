const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Detect real production HTTPS vs local dev
  // We use COOKIE_SECURE env var to explicitly control this,
  // falling back to checking NODE_ENV
  const isSecure = process.env.COOKIE_SECURE === 'true';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isSecure,               // false in local dev, true on Vercel HTTPS
    sameSite: isSecure ? 'None' : 'Lax', // None for cross-origin prod, Lax for same-origin dev
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
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
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || "user",
        terms
      });
      sendTokenResponse(user, 201, res);
    } catch (error) {
      res.status(500).json({ message: "Server error during registration", error: error.message });
    }
  },

  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await bcrypt.compare(password, user.password))) {
        sendTokenResponse(user, 200, res);
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error during login", error: error.message });
    }
  },

  userLogout: (req, res) => {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SECURE === 'true' ? 'None' : 'Lax',
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  },

  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email?.toLowerCase() });
      if (!user) return res.status(404).json({ message: "No user with that email" });

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();

      const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Beach Stall - Password Reset',
        message: `Reset your password here: ${resetUrl}`,
      });
      res.status(200).json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      res.status(500).json({ message: "Error sending email", error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      sendTokenResponse(user, 200, res);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};