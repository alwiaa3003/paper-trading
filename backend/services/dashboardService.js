const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const { refreshPortfolioForUser } = require('../utils/updatePortfolio');

const round2 = (n) => Number((n || 0).toFixed(2));

const getDashboardSummary = async (userId) => {
  const { holdingsWithMetrics, summary, quotes } = await refreshPortfolioForUser(userId);

  const [user, holdingsCount, recentTransactions] = await Promise.all([
    User.findById(userId).select('walletBalance totalPortfolioValue totalProfitLoss rank'),
    Holding.countDocuments({ userId }),
    Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const todaysProfitLoss = holdingsWithMetrics.reduce((total, holding) => {
    const changePerShare = quotes[holding.stockSymbol]?.change ?? 0;
    return total + changePerShare * holding.quantity;
  }, 0);

  const previousCloseValue = summary.currentValue - todaysProfitLoss;
  const todaysProfitLossPercent =
    previousCloseValue > 0 ? (todaysProfitLoss / previousCloseValue) * 100 : 0;

  const walletBalance = round2(user.walletBalance);
  const portfolioValue = round2(summary.currentValue);

  return {
    walletBalance,
    portfolioValue,
    totalAccountValue: round2(walletBalance + portfolioValue),
    todaysProfitLoss: round2(todaysProfitLoss),
    todaysProfitLossPercent: round2(todaysProfitLossPercent),
    overallReturn: {
      amount: round2(summary.totalPL),
      percent: round2(summary.totalReturnPercent),
    },
    investedAmount: round2(summary.investedAmount),
    holdingsCount,
    recentTransactions,
  };
};

module.exports = { getDashboardSummary };