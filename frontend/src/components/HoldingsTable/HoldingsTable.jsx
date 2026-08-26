import { Link } from 'react-router-dom';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const HoldingsTable = ({ holdings }) => {
  if (!holdings?.length) return null;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-mist border-b border-line">
            <th className="px-4 py-3 font-medium">Symbol</th>
            <th className="px-4 py-3 font-medium text-right">Qty</th>
            <th className="px-4 py-3 font-medium text-right">Avg cost</th>
            <th className="px-4 py-3 font-medium text-right">Current price</th>
            <th className="px-4 py-3 font-medium text-right">Current value</th>
            <th className="px-4 py-3 font-medium text-right">P/L</th>
            <th className="px-4 py-3 font-medium text-right">Return %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {holdings.map((h) => {
            const isUp = h.profitLoss >= 0;
            return (
              <tr key={h.stockSymbol}>
                <td className="px-4 py-3">
                  <Link to={`/market/${h.stockSymbol}`} className="font-mono font-medium hover:text-accent">
                    {h.stockSymbol}
                  </Link>
                  <p className="text-xs text-mist">{h.companyName}</p>
                </td>
                <td className="px-4 py-3 text-right stat-tick">{h.quantity}</td>
                <td className="px-4 py-3 text-right stat-tick">{formatCurrency(h.averageBuyPrice)}</td>
                <td className="px-4 py-3 text-right stat-tick">{formatCurrency(h.currentPrice)}</td>
                <td className="px-4 py-3 text-right stat-tick font-semibold">
                  {formatCurrency(h.currentValue)}
                </td>
                <td className={`px-4 py-3 text-right stat-tick ${isUp ? 'text-gain' : 'text-loss'}`}>
                  {isUp ? '+' : ''}
                  {formatCurrency(h.profitLoss)}
                </td>
                <td className={`px-4 py-3 text-right stat-tick ${isUp ? 'text-gain' : 'text-loss'}`}>
                  {isUp ? '+' : ''}
                  {h.profitLossPercent?.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;