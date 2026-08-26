const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// httpOnly cookie options for storing the JWT. httpOnly means client-side JS
// can never read the token (protects against XSS token theft). secure+none
// is required for cross-site cookies in production over HTTPS; in local dev
// (http, same-site) we use lax so the cookie still gets set.
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

module.exports = { generateToken, verifyToken, COOKIE_NAME, getCookieOptions };