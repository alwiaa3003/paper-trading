const mongoose = require('mongoose');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getQuote, SYMBOL_UNIVERSE } = require('../services/stockPriceService');
const { refreshPortfolioForUser } = require('../utils/updatePortfolio');
const { captureDailySnapshot } = require('../utils/portfolioSnapshot');

const buyStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'A valid symbol and positive quantity are required' });
    }

    const meta = SYMBOL_UNIVERSE.find((s) => s.symbol === symbol.toUpperCase());
    if (!meta) {
      return res.status(404).json({ message: `Unknown symbol ${symbol}` });
    }

    const quote = await getQuote(symbol);
    const totalAmount = Number((quote.currentPrice * qty).toFixed(2));

    const user = await User.findById(req.user._id);
    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance for this order' });
    }

    user.walletBalance = Number((user.walletBalance - totalAmount).toFixed(2));
    await user.save();

    let holding = await Holding.findOne({ userId: user._id, stockSymbol: meta.symbol });
    if (holding) {
      const newQuantity = holding.quantity + qty;
      const newAvgPrice =
        (holding.quantity * holding.averageBuyPrice + qty * quote.currentPrice) / newQuantity;
      holding.quantity = newQuantity;
      holding.averageBuyPrice = Number(newAvgPrice.toFixed(4));
      await holding.save();
    } else {
      holding = await Holding.create({
        userId: user._id,
        stockSymbol: meta.symbol,
        companyName: meta.name,
        quantity: qty,
        averageBuyPrice: quote.currentPrice,
      });
    }

    await Transaction.create({
      userId: user._id,
      stockSymbol: meta.symbol,
      companyName: meta.name,
      transactionType: 'BUY',
      quantity: qty,
      price: quote.currentPrice,
      totalAmount,
    });

    const { summary } = await refreshPortfolioForUser(user._id);
    await captureDailySnapshot(user._id, summary, user.walletBalance);

    res.status(201).json({
      message: `Bought ${qty} share(s) of ${meta.symbol} at $${quote.currentPrice}`,
      walletBalance: user.walletBalance,
      holding,
      summary,
    });
  } catch (err) {
    next(err);
  }
};

const sellStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'A valid symbol and positive quantity are required' });
    }

    const holding = await Holding.findOne({ userId: req.user._id, stockSymbol: symbol.toUpperCase() });
    if (!holding || holding.quantity < qty) {
      return res.status(400).json({ message: 'You do not own enough shares to sell this quantity' });
    }

    const quote = await getQuote(symbol);
    const totalAmount = Number((quote.currentPrice * qty).toFixed(2));

    const user = await User.findById(req.user._id);
    user.walletBalance = Number((user.walletBalance + totalAmount).toFixed(2));
    await user.save();

    holding.quantity -= qty;
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }

    await Transaction.create({
      userId: user._id,
      stockSymbol: holding.stockSymbol,
      companyName: holding.companyName,
      transactionType: 'SELL',
      quantity: qty,
      price: quote.currentPrice,
      totalAmount,
    });

    const { summary } = await refreshPortfolioForUser(user._id);
    await captureDailySnapshot(user._id, summary, user.walletBalance);

    res.status(201).json({
      message: `Sold ${qty} share(s) of ${holding.stockSymbol} at $${quote.currentPrice}`,
      walletBalance: user.walletBalance,
      summary,
    });
  } catch (err) {
    next(err);
  }
};

// Allowed sort fields — whitelisted to prevent arbitrary/unsafe sort keys
// from reaching the query.
const SORTABLE_FIELDS = ['createdAt', 'price', 'quantity', 'totalAmount', 'stockSymbol'];

const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      symbol,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { userId: req.user._id };

    // Filtering by transaction type (existing behavior, unchanged)
    if (type && type !== 'ALL') filter.transactionType = type;

    // Exact symbol filter (existing behavior, unchanged — kept for any
    // other caller relying on exact matching)
    if (symbol) filter.stockSymbol = symbol.toUpperCase();

    // Free-text search across symbol and company name (new)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ stockSymbol: regex }, { companyName: regex }];
    }

    // Sorting (new) — whitelisted field, defaults preserve prior behavior
    // (newest first) when no sort params are supplied.
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      sortBy: sortField,
      sortOrder: sortDirection === 1 ? 'asc' : 'desc',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { buyStock, sellStock, getTransactions };