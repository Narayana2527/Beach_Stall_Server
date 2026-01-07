const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

module.exports = {
  // --- REGISTER ---
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

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error during registration", error: error.message });
    }
  },

  // --- LOGIN ---
  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

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
      res.status(500).json({ message: "Server error during login" });
    }
  },

  // --- FORGOT PASSWORD ---
  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email.toLowerCase().trim();
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User with this email doesn't exist." });
      }

      // 1. Generate a raw random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // 2. Hash it and save to DB
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
      await user.save();

      // 3. Create Reset URL (Sending the RAW token to the user)
      const resetURL = `https://beachstall.netlify.app/resetpassword/${resetToken}`;

      const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>You requested to reset your password for <strong>The Beach Stall</strong>.</p>
          <p>This link is valid for 1 hour. Click the button below to continue:</p>
          <a href="${resetURL}" style="background:#4f46e5; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:bold;">Reset Password</a>
          <p style="margin-top:25px; font-size:12px; color:#666;">If you didn't request this, please ignore this email.</p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Password Reset Link - The Beach Stall',
        html: htmlContent,
      });

      res.status(200).json({ message: "Reset link sent to your email!" });

    } catch (err) {
      res.status(500).json({ message: "Error processing request", error: err.message });
    }
  },

  // --- RESET PASSWORD ---
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // 1. Hash the token from the URL to compare with the one in DB
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // 2. Find user with matching token and check if it's still valid
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired link. Please request a new one." });
      }

      // 3. Set new password and clear reset fields
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Success! Your password has been updated." });

    } catch (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  },

  // --- GET PROFILES ---
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
};