import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { usePortfolio } from '../hooks/usePortfolio';
import WalletCard from '../components/WalletCard/WalletCard';
import PortfolioCardComponent from '../components/PortfolioCard/PortfolioCard';
import BuySellModal from '../components/BuySellModal/BuySellModal';
import HoldingsTable from '../components/HoldingsTable/HoldingsTable';
import PortfolioGrowthChart from '../components/PortfolioGrowthChart/PortfolioGrowthChart';
import ProfitLossChart from '../components/ProfitLossChart/ProfitLossChart';
import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import Skeleton, { StatCardsSkeleton, CardGridSkeleton, TableSkeleton } from '../components/Skeleton/Skeleton';

const COLORS = ['#4F46E5', '#1E8E5A', '#C98A2C', '#D64545', '#8B5CF6', '#0EA5A4', '#79766F'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const Portfolio = () => {
  const { data, isLoading, isError, refetch } = usePortfolio();
  const [tradeStock, setTradeStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <StatCardsSkeleton count={4} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-5 w-24" />
            <CardGridSkeleton count={4} columns="sm:grid-cols-2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="card p-4">
              <Skeleton className="h-64 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="card p-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        message="Couldn't load your portfolio right now. Please try again."
        onRetry={refetch}
      />
    );
  }

  const holdings = data?.holdings || [];
  const summary = data?.summary;
  const allocation = holdings.map((h) => ({ name: h.stockSymbol, value: h.currentValue }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Portfolio</h1>
        <p className="text-mist text-sm mt-1">Your simulated holdings, valued at live market prices.</p>
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
        <WalletCard label="Cash available" value={data?.walletBalance} />
      </div>

      {holdings.length === 0 ? (
        <EmptyState
          message="You don't own any stocks yet."
          actionLabel="Browse the market to place your first trade."
          actionTo="/market"
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-display font-semibold">Holdings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {holdings.map((h) => (
                  <PortfolioCardComponent
                    key={h.stockSymbol}
                    holding={h}
                    onTrade={(stock, mode) => {
                      setTradeStock({ ...stock, symbol: stock.stockSymbol, name: stock.companyName, currentPrice: h.currentPrice });
                      setTradeMode(mode);
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display font-semibold mb-3">Allocation</h2>
              <div className="card p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {allocation.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E8E5DE', borderRadius: 10, boxShadow: '0 4px 16px rgba(33,31,28,0.08)' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend
                        formatter={(value) => <span className="text-xs text-mist">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <PortfolioGrowthChart />
            <ProfitLossChart holdings={holdings} />
          </div>

          <div className="space-y-3">
            <h2 className="font-display font-semibold">Holdings detail</h2>
            <HoldingsTable holdings={holdings} />
          </div>
        </>
      )}

      {tradeStock && (
        <BuySellModal
          stock={tradeStock}
          mode={tradeMode}
          walletBalance={data?.walletBalance}
          ownedQuantity={holdings.find((h) => h.stockSymbol === tradeStock.symbol)?.quantity || 0}
          onClose={() => setTradeStock(null)}
        />
      )}
    </div>
  );
};

export default Portfolio;