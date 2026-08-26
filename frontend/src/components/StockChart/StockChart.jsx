import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { getStockHistory } from '../../services/stockService';

const RANGES = ['1D', '1W', '1M', '1Y'];

const StockChart = ({ symbol }) => {
  const [range, setRange] = useState('1M');

  const { data, isLoading } = useQuery({
    queryKey: ['history', symbol, range],
    queryFn: () => getStockHistory(symbol, range),
    enabled: !!symbol,
  });

  const history = data?.history || [];
  const isUp = history.length > 1 && history[history.length - 1].price >= history[0].price;
  const lineColor = isUp ? '#1E8E5A' : '#D64545';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="label-eyebrow">Price history</span>
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
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
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
                labelFormatter={() => symbol}
                formatter={(value) => [`$${value}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#chartFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StockChart;
