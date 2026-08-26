import { Link } from 'react-router-dom';
import { LuStar, LuTrendingUp, LuTrendingDown } from 'react-icons/lu';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const StockCard = ({ stock, onToggleWatch, isWatched, onTrade }) => {
  const isUp = stock.change >= 0;

  return (
    <div className="card p-4 flex flex-col gap-3 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <Link to={`/market/${stock.symbol}`} className="group">
          <p className="font-mono font-semibold tracking-wide group-hover:text-accent transition-colors">
            {stock.symbol}
          </p>
          <p className="text-xs text-mist truncate max-w-[140px]">{stock.name || stock.companyName}</p>
        </Link>
        {onToggleWatch && (
          <button
            onClick={() => onToggleWatch(stock.symbol)}
            className={isWatched ? 'text-signal' : 'text-mist hover:text-signal'}
            aria-label="Toggle watchlist"
          >
            <LuStar size={18} fill={isWatched ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="flex items-end justify-between">
        <span className="stat-tick text-xl font-semibold">{formatCurrency(stock.currentPrice)}</span>
        <span
          className={`flex items-center gap-1 text-sm font-mono ${isUp ? 'text-gain' : 'text-loss'}`}
        >
          {isUp ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}
          {isUp ? '+' : ''}
          {stock.changePercent}%
        </span>
      </div>

      {onTrade && (
        <div className="flex gap-2 pt-1">
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
        </div>
      )}
    </div>
  );
};

export default StockCard;
