const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { refreshPortfolioForUser } = require('../utils/updatePortfolio');

const getPortfolioSnapshot = async (userId) => {
  const { holdingsWithMetrics, summary } = await refreshPortfolioForUser(userId);

  const [portfolio, user] = await Promise.all([
    Portfolio.findOne({ userId }),
    User.findById(userId).select('walletBalance totalPortfolioValue totalProfitLoss rank'),
  ]);

  return {
    portfolio,
    summary,
    holdings: holdingsWithMetrics,
    walletBalance: user.walletBalance,
  };
};

module.exports = { getPortfolioSnapshot };