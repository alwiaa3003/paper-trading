import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuStar, LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import { getStockDetails, getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/stockService';
import { usePortfolio } from '../hooks/usePortfolio';
import StockChart from '../components/StockChart/StockChart';
import BuySellModal from '../components/BuySellModal/BuySellModal';
import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import Skeleton from '../components/Skeleton/Skeleton';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const formatMarketCap = (v) => {
  if (v === null || v === undefined) return 'N/A';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return formatCurrency(v);
};

const formatVolume = (v) => {
  if (v === null || v === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(v);
};

const StockDetails = () => {
  const { symbol } = useParams();
  const queryClient = useQueryClient();
  const [tradeMode, setTradeMode] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStockDetails(symbol),
    // Keeps price, change, and market cap live without the person having to
    // manually refresh the page.
    refetchInterval: 15000,
  });
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist', 'preview'],
    queryFn: getWatchlist,
  });
  const { data: portfolioData } = usePortfolio();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="card p-4 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>

        <div className="card p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        message={error?.response?.data?.message || `Could not load ${symbol}. Please try again.`}
        onRetry={refetch}
      />
    );
  }

  const stock = data?.stock;
  if (!stock) return <EmptyState size="sm" message="Stock not found." />;

  const isUp = stock.change >= 0;
  const isWatched = (watchlistData?.stocks || []).some((s) => s.symbol === stock.symbol);
  const ownedQuantity = portfolioData?.holdings?.find((h) => h.stockSymbol === stock.symbol)?.quantity || 0;

  const toggleWatch = async () => {
    try {
      if (isWatched) {
        await removeFromWatchlist(stock.symbol);
        toast.success(`${stock.symbol} removed from watchlist`);
      } else {
        await addToWatchlist(stock.symbol);
        toast.success(`${stock.symbol} added to watchlist`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update your watchlist');
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-mist hover:text-paper">
        <LuArrowLeft size={16} /> Back to market
      </Link>

      {/* Company information */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-eyebrow">{stock.sector || 'N/A'}</p>
          <h1 className="font-display text-3xl font-semibold mt-1">{stock.symbol}</h1>
          <p className="text-mist truncate">{stock.name || stock.companyName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleWatch}
            className={`card px-3 py-2 flex items-center gap-2 text-sm shrink-0 ${
              isWatched ? 'text-signal' : 'text-mist'
            }`}
          >
            <LuStar size={16} fill={isWatched ? 'currentColor' : 'none'} />
            {isWatched ? 'Watching' : 'Watch'}
          </button>
          <button
            onClick={() => setTradeMode('BUY')}
            className="px-4 py-2.5 rounded-xl font-medium bg-gain hover:bg-gain/90 text-white transition-colors shrink-0"
          >
            Buy
          </button>
          <button
            onClick={() => setTradeMode('SELL')}
            className="px-4 py-2.5 rounded-xl font-medium bg-loss hover:bg-loss/90 text-white transition-colors shrink-0"
          >
            Sell
          </button>
        </div>
      </div>

      {/* Current price + day change */}
      <div className="card p-4">
        <span className="label-eyebrow">Current price</span>
        <div className="flex flex-wrap items-end gap-3 mt-1">
          <span className="stat-tick text-3xl font-semibold">{formatCurrency(stock.currentPrice)}</span>
          <span className={`flex items-center gap-1 font-mono text-sm ${isUp ? 'text-gain' : 'text-loss'}`}>
            {isUp ? <LuTrendingUp size={16} /> : <LuTrendingDown size={16} />}
            {isUp ? '+' : ''}
            {stock.change} ({isUp ? '+' : ''}
            {stock.changePercent}%)
          </span>
        </div>
      </div>

      {/* Market cap, sector, and other company/market stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <span className="label-eyebrow">Market cap</span>
          <p className="stat-tick text-lg mt-1">{formatMarketCap(stock.marketCap)}</p>
        </div>
        <div className="card p-4">
          <span className="label-eyebrow">Sector</span>
          <p className="stat-tick text-lg mt-1 truncate">{stock.sector || 'N/A'}</p>
        </div>
        <div className="card p-4">
          <span className="label-eyebrow">Open</span>
          <p className="stat-tick text-lg mt-1">{formatCurrency(stock.open)}</p>
        </div>
        <div className="card p-4">
          <span className="label-eyebrow">High</span>
          <p className="stat-tick text-lg mt-1">{formatCurrency(stock.high)}</p>
        </div>
        <div className="card p-4">
          <span className="label-eyebrow">Low</span>
          <p className="stat-tick text-lg mt-1">{formatCurrency(stock.low)}</p>
        </div>
        <div className="card p-4">
          <span className="label-eyebrow">Volume</span>
          <p className="stat-tick text-lg mt-1">{formatVolume(stock.volume)}</p>
        </div>
      </div>

      {/* Historical chart */}
      <StockChart symbol={stock.symbol} />

      {tradeMode && (
        <BuySellModal
          stock={stock}
          mode={tradeMode}
          walletBalance={portfolioData?.walletBalance}
          ownedQuantity={ownedQuantity}
          onClose={() => setTradeMode(null)}
        />
      )}
    </div>
  );
};

export default StockDetails;