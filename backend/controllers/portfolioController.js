const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const { refreshPortfolioForUser } = require('../utils/updatePortfolio');

const getPortfolio = async (req, res, next) => {
  try {
    const { holdingsWithMetrics, summary } = await refreshPortfolioForUser(req.user._id);
    const [portfolio, freshUser] = await Promise.all([
      Portfolio.findOne({ userId: req.user._id }),
      User.findById(req.user._id),
    ]);

    res.json({
      portfolio,
      summary,
      holdings: holdingsWithMetrics,
      walletBalance: freshUser.walletBalance,
    });
  } catch (err) {
    next(err);
  }
};

const RANGE_DAYS = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };

const getPortfolioGrowth = async (req, res, next) => {
  try {
    const { range = '1M' } = req.query;
    const days = RANGE_DAYS[range];

    const filter = { userId: req.user._id };
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filter.date = { $gte: cutoff.toISOString().slice(0, 10) };
    }

    const snapshots = await PortfolioSnapshot.find(filter).sort({ date: 1 });

    res.json({ range, snapshots });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPortfolio, getPortfolioGrowth };