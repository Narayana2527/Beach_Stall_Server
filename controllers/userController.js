const User = require('../model/userModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address." });
    }

    // Search for user using case-insensitive trim
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      // Debugging: check your console to see what exactly was sent
      console.log(`Failed attempt for email: ${email}`);
      return res.status(404).json({ message: "User with this email doesn't exist." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; 

    await user.save();

    // Log the token so you can test manually in Postman or Browser
    console.log("TESTING RESET LINK:", `http://localhost:5173/resetpassword/${resetToken}`);
    
    res.status(200).json({ 
      message: "Reset link generated!", 
      token: resetToken // Only keep this during development!
    }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
},

  // 2. VERIFY TOKEN AND SAVE NEW PASSWORD
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
