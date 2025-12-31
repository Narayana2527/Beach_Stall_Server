const User = require('../model/userModel'); // Your Mongoose Model

const getMe = async (req, res) => {
  try {
    // req.user was set by the 'protect' middleware
    const user = await User.findById(req.user).select('-password');
    
    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // e.g., 'admin' or 'customer'
        // profilePic: user.profilePic
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMe };