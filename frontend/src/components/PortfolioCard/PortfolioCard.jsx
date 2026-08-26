import { Link } from 'react-router-dom';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const PortfolioCard = ({ holding, onTrade }) => {
  const isUp = holding.profitLoss >= 0;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Link to={`/market/${holding.stockSymbol}`}>
          <p className="font-mono font-semibold">{holding.stockSymbol}</p>
          <p className="text-xs text-mist truncate max-w-[160px]">{holding.companyName}</p>
        </Link>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${isUp ? 'bg-gain/15 text-gain' : 'bg-loss/15 text-loss'}`}>
          {isUp ? '+' : ''}
          {holding.profitLossPercent?.toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-1.5 text-sm">
        <span className="text-mist">Qty</span>
        <span className="stat-tick text-right">{holding.quantity}</span>
        <span className="text-mist">Avg cost</span>
        <span className="stat-tick text-right">{formatCurrency(holding.averageBuyPrice)}</span>
        <span className="text-mist">Current value</span>
        <span className="stat-tick text-right font-semibold">{formatCurrency(holding.currentValue)}</span>
        <span className="text-mist">P/L</span>
        <span className={`stat-tick text-right ${isUp ? 'text-gain' : 'text-loss'}`}>
          {isUp ? '+' : ''}
          {formatCurrency(holding.profitLoss)}
        </span>
      </div>

      {onTrade && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onTrade(holding, 'BUY')}
            className="flex-1 text-sm font-medium py-1.5 rounded-xl bg-gain/15 text-gain hover:bg-gain/25 transition-colors"
          >
            Buy more
          </button>
          <button
            onClick={() => onTrade(holding, 'SELL')}
            className="flex-1 text-sm font-medium py-1.5 rounded-xl bg-loss/15 text-loss hover:bg-loss/25 transition-colors"
          >
            Sell
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
