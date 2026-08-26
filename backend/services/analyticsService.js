const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const { getPortfolioSnapshot } = require('./portfolioService');

const round2 = (n) => Number((n || 0).toFixed(2));
const RANGE_DAYS = { '1M': 30, '3M': 90, '1Y': 365, ALL: null };
const VALID_RANGES = Object.keys(RANGE_DAYS);
const isValidRange = (range) => VALID_RANGES.includes(range);

const buildDateFilter = (userId, range) => {
  const days = RANGE_DAYS[range];
  const query = { userId };
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    query.date = { $gte: cutoff.toISOString().slice(0, 10) };
  }
  return query;
};

const getPortfolioGrowth = async (userId, range) => {
  const snapshots = await PortfolioSnapshot.find(buildDateFilter(userId, range))
    .sort({ date: 1 }).select('date totalPortfolioValue').lean();
  return snapshots.map((s) => ({ date: s.date, value: round2(s.totalPortfolioValue) }));
};

const getProfitLossTrend = async (userId, range) => {
  const snapshots = await PortfolioSnapshot.find(buildDateFilter(userId, range))
    .sort({ date: 1 }).select('date totalProfitLoss').lean();
  return snapshots.map((s) => ({ date: s.date, value: round2(s.totalProfitLoss) }));
};

const getAssetAllocation = async (userId) => {
  const { walletBalance, summary } = await getPortfolioSnapshot(userId);
  return [
    { label: 'Cash', value: round2(walletBalance) },
    { label: 'Invested', value: round2(summary.currentValue) },
  ];
};

const getHoldingsDistribution = async (userId) => {
  const { holdings } = await getPortfolioSnapshot(userId);
  return holdings
    .map((h) => ({ label: h.stockSymbol, value: round2(h.currentValue) }))
    .sort((a, b) => b.value - a.value);
};

const getAnalytics = async (userId, range = '1M') => {
  const [portfolioGrowth, profitLoss, assetAllocation, holdingsDistribution] = await Promise.all([
    getPortfolioGrowth(userId, range),
    getProfitLossTrend(userId, range),
    getAssetAllocation(userId),
    getHoldingsDistribution(userId),
  ]);
  return { range, portfolioGrowth, profitLoss, assetAllocation, holdingsDistribution };
};

module.exports = { getAnalytics, isValidRange, VALID_RANGES };