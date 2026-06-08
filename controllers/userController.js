const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // COOKIE_SECURE=false in local .env → cookie works on HTTP localhost
  // COOKIE_SECURE=true on Vercel (HTTPS) → secure cookie for production
  const isSecure = process.env.COOKIE_SECURE === 'true';

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'None' : 'Lax',
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

      sendTokenResponse(user, 201, res);

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
        sendTokenResponse(user, 200, res);
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login error" });
    }
  },

  // --- LOGOUT ---
  userLogout: async (req, res) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'User logged out' });
  },

  // --- FORGOT PASSWORD ---
  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email.toLowerCase().trim();
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User with this email doesn't exist." });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
      await user.save();

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

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired link. Please request a new one." });
      }

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