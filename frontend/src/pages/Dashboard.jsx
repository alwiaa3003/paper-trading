import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { getMarket, getWatchlist } from '../services/stockService';
import { useAuth } from '../hooks/useAuth';
import WalletCard from '../components/WalletCard/WalletCard';
import StockCard from '../components/StockCard/StockCard';
import ErrorCard from '../components/ErrorCard/ErrorCard';
import Skeleton, { StatCardsSkeleton, CardGridSkeleton } from '../components/Skeleton/Skeleton';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const Dashboard = () => {
  const { user } = useAuth();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();
  const {
    data: marketData,
    isLoading: marketLoading,
    isError: marketError,
  } = useQuery({
    queryKey: ['market', 'dashboard'],
    queryFn: () => getMarket(),
  });
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist', 'preview'],
    queryFn: getWatchlist,
  });

  if (dashboardLoading || marketLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <StatCardsSkeleton count={4} />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <CardGridSkeleton count={3} columns="sm:grid-cols-3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <CardGridSkeleton count={3} columns="sm:grid-cols-3" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <CardGridSkeleton count={4} columns="sm:grid-cols-2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="card divide-y divide-line">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <ErrorCard
        message="Couldn't load your dashboard right now. Please try refreshing the page."
        onRetry={refetchDashboard}
      />
    );
  }

  const sortedByChange = [...(marketData?.stocks || [])].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  const gainers = sortedByChange.slice(0, 3);
  const losers = sortedByChange.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-mist text-sm mt-1">Here's where your simulated portfolio stands today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WalletCard label="Wallet balance" value={dashboardData?.walletBalance} />
        <WalletCard label="Portfolio value" value={dashboardData?.portfolioValue} accent="accent" />
        <WalletCard
          label="Total return"
          value={dashboardData?.overallProfitLoss}
          delta={dashboardData?.overallProfitLoss}
          deltaPercent={dashboardData?.returnPercent}
          accent={dashboardData?.overallProfitLoss >= 0 ? 'gain' : 'loss'}
        />
        <WalletCard
          label="Today's P/L"
          value={dashboardData?.todaysProfitLoss}
          delta={dashboardData?.todaysProfitLoss}
          accent={dashboardData?.todaysProfitLoss >= 0 ? 'gain' : 'loss'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Top gainers</h2>
            <Link to="/market" className="text-sm text-accent hover:underline">View market</Link>
          </div>
          {marketError ? (
            <div className="card p-6 text-center text-mist text-sm">Market data unavailable right now.</div>
          ) : gainers.length ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {gainers.map((s) => (
                <StockCard key={s.symbol} stock={s} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-mist text-sm">No market data available.</div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Top losers</h2>
            <Link to="/market" className="text-sm text-accent hover:underline">View market</Link>
          </div>
          {marketError ? (
            <div className="card p-6 text-center text-mist text-sm">Market data unavailable right now.</div>
          ) : losers.length ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {losers.map((s) => (
                <StockCard key={s.symbol} stock={s} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-mist text-sm">No market data available.</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Watchlist</h2>
            <Link to="/watchlist" className="text-sm text-accent hover:underline">See all</Link>
          </div>
          {watchlistData?.stocks?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {watchlistData.stocks.slice(0, 4).map((s) => (
                <StockCard key={s.symbol} stock={s} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-mist text-sm">
              Nothing on your watchlist yet.{' '}
              <Link to="/market" className="text-accent hover:underline">Browse the market</Link>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Recent transactions</h2>
            <Link to="/transactions" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="card divide-y divide-line">
            {dashboardData?.recentTransactions?.length ? (
              dashboardData.recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="font-mono font-medium">{tx.stockSymbol}</span>
                    <span
                      className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                        tx.transactionType === 'BUY' ? 'bg-gain/15 text-gain' : 'bg-loss/15 text-loss'
                      }`}
                    >
                      {tx.transactionType}
                    </span>
                  </div>
                  <span className="stat-tick text-mist">{formatCurrency(tx.totalAmount)}</span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-mist text-sm">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;