const PortfolioSnapshot = require('../models/PortfolioSnapshot');

const captureDailySnapshot = async (userId, summary, walletBalance) => {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const totalAccountValue = Number((summary.currentValue + walletBalance).toFixed(2));

  await PortfolioSnapshot.findOneAndUpdate(
    { userId, date },
    {
      investedAmount: summary.investedAmount,
      currentValue: summary.currentValue,
      totalPL: summary.totalPL,
      totalReturnPercent: summary.totalReturnPercent,
      walletBalance,
      totalAccountValue,
    },
    { upsert: true, new: true }
  );
};

module.exports = { captureDailySnapshot };