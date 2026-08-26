const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

// Reusable ranked list — used for both Top and Worst performing holdings,
// sourced entirely from the holdings array already returned by
// GET /api/portfolio (no new fetch, no new calculation).
const HoldingsPerformanceList = ({ holdings = [], variant = 'top', count = 5, title }) => {
  const sorted = [...holdings].sort((a, b) =>
    variant === 'top'
      ? (b.profitLossPercent ?? 0) - (a.profitLossPercent ?? 0)
      : (a.profitLossPercent ?? 0) - (b.profitLossPercent ?? 0)
  );
  const list = sorted.slice(0, count);

  return (
    <div className="card p-4">
      <span className="label-eyebrow">{title}</span>
      {list.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-mist text-sm">
          No holdings to rank yet.
        </div>
      ) : (
        <div className="divide-y divide-line mt-2">
          {list.map((h) => {
            const isUp = h.profitLoss >= 0;
            return (
              <div key={h.stockSymbol} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="font-mono font-medium">{h.stockSymbol}</span>
                  <p className="text-xs text-mist truncate max-w-[160px]">{h.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="stat-tick font-semibold">{formatCurrency(h.currentValue)}</p>
                  <p className={`stat-tick text-xs ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}
                    {h.profitLossPercent?.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HoldingsPerformanceList;