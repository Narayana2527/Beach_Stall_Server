const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const protect = async (req, res, next) => {
  let token;

  // 1. Look for the token in the cookies instead of headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Fallback check (optional: still allows Bearer headers for testing in Postman)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 4. Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    
    // If token is expired or invalid, clear the cookie and return error
    res.clearCookie('token');
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };