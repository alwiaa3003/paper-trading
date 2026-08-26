const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const User = require('../models/User');
const { getQuotes } = require('../services/stockPriceService');
const { calculateHoldingMetrics, calculatePortfolioSummary } = require('./calculateProfit');

const refreshPortfolioForUser = async (userId) => {
  const holdings = await Holding.find({ userId });

  let holdingsWithMetrics = [];
  let quotes = {};
  if (holdings.length > 0) {
    const symbols = holdings.map((h) => h.stockSymbol);
    quotes = await getQuotes(symbols);
    holdingsWithMetrics = holdings.map((h) => {
      const price = quotes[h.stockSymbol]?.currentPrice ?? h.averageBuyPrice;
      return { ...h.toObject(), ...calculateHoldingMetrics(h, price) };
    });
  }

  const summary = calculatePortfolioSummary(holdingsWithMetrics);

  await Portfolio.findOneAndUpdate(
    { userId },
    {
      investedAmount: summary.investedAmount,
      currentValue: summary.currentValue,
      totalProfit: summary.totalProfit,
      totalLoss: summary.totalLoss,
      totalReturnPercent: summary.totalReturnPercent,
    },
    { upsert: true, new: true }
  );

  const user = await User.findById(userId);
  const totalPortfolioValue = summary.currentValue + user.walletBalance;
  const startingBalance = Number(process.env.STARTING_BALANCE) || 100000;

  user.totalPortfolioValue = totalPortfolioValue;
  user.totalProfitLoss = Number((totalPortfolioValue - startingBalance).toFixed(2));
  user.totalReturnPercent = Number(
    (((totalPortfolioValue - startingBalance) / startingBalance) * 100).toFixed(2)
  );
  await user.save();

  const today = new Date().toISOString().slice(0, 10);
  await PortfolioSnapshot.findOneAndUpdate(
    { userId, date: today },
    {
      walletBalance: user.walletBalance,
      holdingsValue: summary.currentValue,
      totalPortfolioValue: user.totalPortfolioValue,
      totalProfitLoss: user.totalProfitLoss,
      totalReturnPercent: user.totalReturnPercent,
    },
    { upsert: true }
  );

  return { holdingsWithMetrics, summary, quotes };
};

module.exports = { refreshPortfolioForUser };