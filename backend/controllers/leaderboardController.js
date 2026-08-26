const { getLeaderboard, isValidSortBy } = require('../services/leaderboardService');

const getLeaderboardHandler = async (req, res, next) => {
  try {
    const { sortBy = 'portfolioValue' } = req.query;

    if (!isValidSortBy(sortBy)) {
      return res.status(400).json({
        message: 'sortBy must be one of: portfolioValue, profit, returnPercent',
      });
    }

    const result = await getLeaderboard(sortBy, req.user?._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard: getLeaderboardHandler };