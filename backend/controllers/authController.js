const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const { generateToken, COOKIE_NAME, getCookieOptions } = require('../config/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    await Watchlist.create({ userId: user._id, stocks: [] });
    await Portfolio.create({ userId: user._id });

    const token = generateToken(user._id);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected — used for auto-login after refresh)
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset  (protected)
const resetPortfolio = async (req, res, next) => {
  try {
    await Holding.deleteMany({ userId: req.user._id });
    await Transaction.deleteMany({ userId: req.user._id });
    // Clears daily portfolio-value history too, so the Growth chart starts
    // fresh instead of showing a false spike/drop against pre-reset data.
    await PortfolioSnapshot.deleteMany({ userId: req.user._id });
    await Portfolio.findOneAndUpdate(
      { userId: req.user._id },
      { investedAmount: 0, currentValue: 0, totalProfit: 0, totalLoss: 0, totalReturnPercent: 0 }
    );

    req.user.walletBalance = Number(process.env.STARTING_BALANCE) || 100000;
    req.user.totalPortfolioValue = req.user.walletBalance;
    req.user.totalProfitLoss = 0;
    await req.user.save();

    res.json({ message: 'Portfolio reset successfully', user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe, resetPortfolio };