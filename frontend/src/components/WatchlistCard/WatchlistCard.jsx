import { Link } from 'react-router-dom';
import { LuX, LuTrendingUp, LuTrendingDown, LuEye } from 'react-icons/lu';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const WatchlistCard = ({ stock, onRemove, onTrade, isRemoving = false }) => {
  const isUp = stock.change >= 0;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Link to={`/market/${stock.symbol}`}>
          <p className="font-mono font-semibold">{stock.symbol}</p>
          <p className="text-xs text-mist truncate max-w-[160px]">{stock.name}</p>
        </Link>
        <button
          onClick={() => onRemove(stock.symbol)}
          disabled={isRemoving}
          className="text-mist hover:text-loss disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Remove from watchlist"
        >
          <LuX size={18} />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <span className="stat-tick text-lg font-semibold">{formatCurrency(stock.currentPrice)}</span>
        <span className={`flex items-center gap-1 text-sm font-mono ${isUp ? 'text-gain' : 'text-loss'}`}>
          {isUp ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}
          {isUp ? '+' : ''}
          {stock.changePercent}%
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTrade(stock, 'BUY')}
          className="flex-1 text-sm font-medium py-1.5 rounded-xl bg-gain/15 text-gain hover:bg-gain/25 transition-colors"
        >
          Buy
        </button>
        <button
          onClick={() => onTrade(stock, 'SELL')}
          className="flex-1 text-sm font-medium py-1.5 rounded-xl bg-loss/15 text-loss hover:bg-loss/25 transition-colors"
        >
          Sell
        </button>
        <Link
          to={`/market/${stock.symbol}`}
          aria-label={`View ${stock.symbol} details`}
          className="flex items-center justify-center px-3 rounded-xl bg-panel2 text-mist hover:text-paper transition-colors"
        >
          <LuEye size={16} />
        </Link>
      </div>
    </div>
  );
};

export default WatchlistCard;