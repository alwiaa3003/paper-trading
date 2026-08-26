const { getDashboardSummary } = require('../services/dashboardService');

// GET /api/dashboard  (protected)
const getDashboard = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user._id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };