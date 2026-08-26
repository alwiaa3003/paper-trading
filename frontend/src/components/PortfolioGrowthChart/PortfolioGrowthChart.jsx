import { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { usePortfolioGrowth } from '../../hooks/usePortfolioGrowth';

const RANGES = ['1M', '3M', '6M', '1Y'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const PortfolioGrowthChart = () => {
  const [range, setRange] = useState('1M');
  const { data, isLoading } = usePortfolioGrowth(range);

  const snapshots = data?.snapshots || [];
  const isUp =
    snapshots.length > 1 &&
    snapshots[snapshots.length - 1].totalAccountValue >= snapshots[0].totalAccountValue;
  const lineColor = isUp ? '#1E8E5A' : '#D64545';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="label-eyebrow">Portfolio growth</span>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
                range === r ? 'bg-panel2 text-paper border border-line' : 'text-mist hover:text-paper'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-mist text-sm">Loading chart…</div>
        ) : snapshots.length === 0 ? (
          <div className="h-full flex items-center justify-center text-mist text-sm text-center px-6">
            Not enough history yet — a snapshot is captured after each trade.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshots} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E5DE',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(33,31,28,0.08)',
                }}
                itemStyle={{ color: '#211F1C' }}
                labelStyle={{ color: '#79766F' }}
                formatter={(value) => [formatCurrency(value), 'Total value']}
              />
              <Area
                type="monotone"
                dataKey="totalAccountValue"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#growthFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PortfolioGrowthChart;