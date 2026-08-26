const mongoose = require('mongoose');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { SYMBOL_UNIVERSE } = require('../config/stockAPI');
const { getQuote } = require('./stockPriceService');
const { getPortfolioSnapshot } = require('./portfolioService');

// Domain-specific error with an HTTP status attached, so controllers can
// stay thin and just `next(err)` — errorMiddleware reads `err.statusCode`.
class TradeError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'TradeError';
    this.statusCode = statusCode;
  }
}

const validateSymbol = (symbolInput) => {
  const upperSymbol = (symbolInput || '').toString().trim().toUpperCase();
  if (!upperSymbol) {
    throw new TradeError('A stock symbol is required', 400);
  }
  const meta = SYMBOL_UNIVERSE.find((s) => s.symbol === upperSymbol);
  if (!meta) {
    throw new TradeError(`Unknown symbol ${upperSymbol}`, 404);
  }
  return meta;
};

const validateQuantity = (quantityInput) => {
  const qty = Number(quantityInput);
  if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
    throw new TradeError('Quantity must be a whole number greater than 0', 400);
  }
  return qty;
};

// Buys `quantity` shares of `symbol` for `userId` at the latest market
// price. Wallet debit, holding upsert, and the transaction log entry are
// written inside a single MongoDB session transaction — either all three
// commit, or none do, so a mid-write failure can never leave a user with
// cash deducted but no shares (or vice versa).
const buyStock = async (userId, symbolInput, quantityInput) => {
  const meta = validateSymbol(symbolInput);
  const qty = validateQuantity(quantityInput);

  // Pricing comes from the (non-transactional) price service, fetched once
  // up front so every write below uses the exact same execution price.
  const quote = await getQuote(meta.symbol);
  const totalAmount = Number((quote.currentPrice * qty).toFixed(2));

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new TradeError('User not found', 404);
      }
      if (user.walletBalance < totalAmount) {
        throw new TradeError('Insufficient wallet balance for this order', 400);
      }

      user.walletBalance = Number((user.walletBalance - totalAmount).toFixed(2));
      await user.save({ session });

      const holding = await Holding.findOne({ userId, stockSymbol: meta.symbol }).session(session);
      if (holding) {
        const newQuantity = holding.quantity + qty;
        const newAvgPrice =
          (holding.quantity * holding.averageBuyPrice + qty * quote.currentPrice) / newQuantity;
        holding.quantity = newQuantity;
        holding.averageBuyPrice = Number(newAvgPrice.toFixed(4));
        await holding.save({ session });
      } else {
        await Holding.create(
          [
            {
              userId,
              stockSymbol: meta.symbol,
              companyName: meta.name,
              quantity: qty,
              averageBuyPrice: quote.currentPrice,
            },
          ],
          { session }
        );
      }

      await Transaction.create(
        [
          {
            userId,
            stockSymbol: meta.symbol,
            companyName: meta.name,
            transactionType: 'BUY',
            quantity: qty,
            price: quote.currentPrice,
            totalAmount,
          },
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  // Recomputing portfolio aggregates is a derived read+write over the
  // now-committed holdings — intentionally kept outside the atomic trade
  // itself (reuses the same shared snapshot logic every portfolio read uses,
  // so this never drifts out of sync with GET /portfolio or the dashboard).
  const portfolio = await getPortfolioSnapshot(userId);

  return {
    message: `Bought ${qty} share(s) of ${meta.symbol} at $${quote.currentPrice}`,
    order: { symbol: meta.symbol, type: 'BUY', quantity: qty, price: quote.currentPrice, totalAmount },
    portfolio,
  };
};

// Sells `quantity` shares of `symbol` for `userId`, same atomicity
// guarantees as buyStock above.
const sellStock = async (userId, symbolInput, quantityInput) => {
  const upperSymbol = (symbolInput || '').toString().trim().toUpperCase();
  if (!upperSymbol) {
    throw new TradeError('A stock symbol is required', 400);
  }
  const qty = validateQuantity(quantityInput);

  const quote = await getQuote(upperSymbol);
  const totalAmount = Number((quote.currentPrice * qty).toFixed(2));

  const session = await mongoose.startSession();
  let soldSymbol;
  try {
    await session.withTransaction(async () => {
      const holding = await Holding.findOne({ userId, stockSymbol: upperSymbol }).session(session);
      if (!holding || holding.quantity < qty) {
        throw new TradeError('You do not own enough shares to sell this quantity', 400);
      }
      soldSymbol = holding.stockSymbol;

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new TradeError('User not found', 404);
      }
      user.walletBalance = Number((user.walletBalance + totalAmount).toFixed(2));
      await user.save({ session });

      holding.quantity -= qty;
      if (holding.quantity === 0) {
        await Holding.deleteOne({ _id: holding._id }).session(session);
      } else {
        await holding.save({ session });
      }

      await Transaction.create(
        [
          {
            userId,
            stockSymbol: holding.stockSymbol,
            companyName: holding.companyName,
            transactionType: 'SELL',
            quantity: qty,
            price: quote.currentPrice,
            totalAmount,
          },
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  const portfolio = await getPortfolioSnapshot(userId);

  return {
    message: `Sold ${qty} share(s) of ${soldSymbol} at $${quote.currentPrice}`,
    order: { symbol: soldSymbol, type: 'SELL', quantity: qty, price: quote.currentPrice, totalAmount },
    portfolio,
  };
};

module.exports = { buyStock, sellStock, TradeError };