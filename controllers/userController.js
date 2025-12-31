const User = require('../model/userModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
