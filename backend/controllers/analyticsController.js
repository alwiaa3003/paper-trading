const { getAnalytics, isValidRange, VALID_RANGES } = require('../services/analyticsService');

const getAnalyticsHandler = async (req, res, next) => {
  try {
    const { range = '1M' } = req.query;
    if (!isValidRange(range)) {
      return res.status(400).json({ message: `range must be one of: ${VALID_RANGES.join(', ')}` });
    }
    const analytics = await getAnalytics(req.user._id, range);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics: getAnalyticsHandler };