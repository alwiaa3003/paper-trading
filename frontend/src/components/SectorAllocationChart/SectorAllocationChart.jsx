import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getMarket } from '../../services/stockService';

const COLORS = ['#4F46E5', '#1E8E5A', '#C98A2C', '#D64545', '#8B5CF6', '#0EA5A4', '#79766F', '#DB2777'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

// Groups current holdings value by sector. Sector metadata comes from the
// existing /api/stocks universe (already used by Market/Dashboard) — no new
// backend endpoint, just a client-side join with holdings.
const SectorAllocationChart = ({ holdings = [] }) => {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market'],
    queryFn: () => getMarket(),
  });

  const sectorData = useMemo(() => {
    if (!holdings.length || !marketData?.stocks?.length) return [];

    const sectorBySymbol = marketData.stocks.reduce((map, s) => {
      map[s.symbol] = s.sector || 'Other';
      return map;
    }, {});

    const totals = holdings.reduce((map, h) => {
      const sector = sectorBySymbol[h.stockSymbol] || 'Other';
      map[sector] = (map[sector] || 0) + h.currentValue;
      return map;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [holdings, marketData]);

  if (isLoading) {
    return (
      <div className="card p-4">
        <span className="label-eyebrow">Holdings by sector</span>
        <div className="h-64 flex items-center justify-center text-mist text-sm">Loading…</div>
      </div>
    );
  }

  if (sectorData.length === 0) {
    return (
      <div className="card p-4">
        <span className="label-eyebrow">Holdings by sector</span>
        <div className="h-64 flex items-center justify-center text-mist text-sm">
          No holdings to break down yet.
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <span className="label-eyebrow">Holdings by sector</span>
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectorData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {sectorData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DE',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(33,31,28,0.08)',
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend formatter={(value) => <span className="text-xs text-mist">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorAllocationChart;