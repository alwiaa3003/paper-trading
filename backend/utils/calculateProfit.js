const calculateHoldingMetrics = (holding, currentPrice) => {
  const currentValue = holding.quantity * currentPrice;
  const investedValue = holding.quantity * holding.averageBuyPrice;
  const profitLoss = currentValue - investedValue;
  const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

  return {
    currentPrice,
    currentValue,
    profitLoss,
    profitLossPercent,
  };
};

const calculatePortfolioSummary = (holdingsWithMetrics) => {
  const investedAmount = holdingsWithMetrics.reduce(
    (sum, h) => sum + h.quantity * h.averageBuyPrice,
    0
  );
  const currentValue = holdingsWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPL = currentValue - investedAmount;
  const totalProfit = totalPL > 0 ? totalPL : 0;
  const totalLoss = totalPL < 0 ? Math.abs(totalPL) : 0;
  const totalReturnPercent = investedAmount > 0 ? (totalPL / investedAmount) * 100 : 0;

  return { investedAmount, currentValue, totalProfit, totalLoss, totalReturnPercent, totalPL };
};

module.exports = { calculateHoldingMetrics, calculatePortfolioSummary };
