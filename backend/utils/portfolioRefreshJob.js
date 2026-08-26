const cron = require('node-cron');
const User = require('../models/User');
const { refreshPortfolioForUser } = require('./updatePortfolio');

const BATCH_SIZE = 5;

const refreshAllPortfolios = async () => {
  const users = await User.find({}, '_id').lean();

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(({ _id }) =>
        refreshPortfolioForUser(_id).catch((err) => {
          console.error(`[portfolioRefreshJob] Failed to refresh user ${_id}: ${err.message}`);
        })
      )
    );
  }
};

const start = () => {
  cron.schedule('*/5 * * * *', () => {
    refreshAllPortfolios().catch((err) => {
      console.error(`[portfolioRefreshJob] Batch refresh failed: ${err.message}`);
    });
  });
};

module.exports = { start, refreshAllPortfolios };