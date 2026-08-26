import { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { usePortfolioGrowth } from '../../hooks/usePortfolioGrowth';

const RANGES = ['1M', '3M', '6M', '1Y'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

// Plots totalPL (already computed and persisted per-day by
// captureDailySnapshot) over time — no new calculation, just reusing the
// same snapshot history that powers PortfolioGrowthChart.
const ProfitLossTrendChart = () => {
  const [range, setRange] = useState('1M');
  const { data, isLoading } = usePortfolioGrowth(range);

  const snapshots = data?.snapshots || [];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="label-eyebrow">Profit / loss trend</span>
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
            <BarChart data={snapshots} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E5DE',
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(33,31,28,0.08)',
                }}
                labelStyle={{ color: '#79766F' }}
                formatter={(value) => [formatCurrency(value), 'Total P/L']}
              />
              <Bar dataKey="totalPL" radius={[4, 4, 0, 0]}>
                {snapshots.map((s, idx) => (
                  <Cell key={idx} fill={s.totalPL >= 0 ? '#1E8E5A' : '#D64545'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProfitLossTrendChart;