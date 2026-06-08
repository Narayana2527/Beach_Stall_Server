const User = require('../model/userModel');

const getMe = async (req, res) => {
  try {
    // req.user is already the full user object from protect middleware
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const checkAuth = async (req, res) => {
  try {
    // req.user is already populated by protect middleware — no extra DB query needed
    if (!req.user) return res.status(401).json({ message: "User not found" });
    res.status(200).json({ isLoggedIn: true, user: req.user });
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { getMe, checkAuth };