const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

// Reads the JWT from the httpOnly cookie (preferred) or a Bearer header
// (useful for testing with tools like Postman/curl that don't send cookies).
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired, please log in again'
        : 'Not authorized, invalid token';
    return res.status(401).json({ message });
  }
};

module.exports = { protect };