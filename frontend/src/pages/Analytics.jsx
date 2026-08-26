import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import WalletCard from '../components/WalletCard/WalletCard';
import Loader from '../components/Loader/Loader';
import PortfolioGrowthChart from '../components/PortfolioGrowthChart/PortfolioGrowthChart';
import ProfitLossChart from '../components/ProfitLossChart/ProfitLossChart';
import ProfitLossTrendChart from '../components/ProfitLossTrendChart/ProfitLossTrendChart';
import AllocationChart from '../components/AllocationChart/AllocationChart';
import SectorAllocationChart from '../components/SectorAllocationChart/SectorAllocationChart';
import HoldingsPerformanceList from '../components/HoldingsPerformanceList/HoldingsPerformanceList';

// Every chart/section here is sourced from data already fetched elsewhere
// in the app (usePortfolio, usePortfolioGrowth, getMarket) — this page adds
// no new backend calls of its own beyond what those hooks/components
// already make.
const Analytics = () => {
  const { data, isLoading, isError } = usePortfolio();

  if (isLoading) return <Loader label="Crunching your analytics" />;

  if (isError) {
    return (
      <div className="card p-8 text-center text-sm text-loss">
        Couldn't load your analytics right now. Please try again.
      </div>
    );
  }

  const holdings = data?.holdings || [];
  const summary = data?.summary;
  const walletBalance = data?.walletBalance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-mist text-sm mt-1">
          A deeper look at how your simulated portfolio is performing.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WalletCard label="Invested amount" value={summary?.investedAmount} />
        <WalletCard label="Current value" value={summary?.currentValue} accent="accent" />
        <WalletCard
          label="Total P/L"
          value={summary?.totalPL}
          delta={summary?.totalPL}
          deltaPercent={summary?.totalReturnPercent}
          accent={summary?.totalPL >= 0 ? 'gain' : 'loss'}
        />
        <WalletCard label="Cash available" value={walletBalance} />
      </div>

      {holdings.length === 0 ? (
        <div className="card p-10 text-center text-mist">
          You don't own any stocks yet — analytics will populate once you place your first trade.{' '}
          <Link to="/market" className="text-accent hover:underline">Browse the market</Link>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <PortfolioGrowthChart />
            <ProfitLossTrendChart />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <AllocationChart holdings={holdings} />
            <SectorAllocationChart holdings={holdings} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ProfitLossChart holdings={holdings} />
            <div className="grid gap-6">
              <HoldingsPerformanceList holdings={holdings} variant="top" title="Top performing holdings" />
              <HoldingsPerformanceList holdings={holdings} variant="worst" title="Worst performing holdings" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;