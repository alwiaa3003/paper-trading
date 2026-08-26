import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#4F46E5', '#1E8E5A', '#C98A2C', '#D64545', '#8B5CF6', '#0EA5A4', '#79766F'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const AllocationChart = ({ holdings = [] }) => {
  const allocation = holdings.map((h) => ({ name: h.stockSymbol, value: h.currentValue }));

  if (allocation.length === 0) {
    return (
      <div className="card p-4">
        <span className="label-eyebrow">Asset allocation</span>
        <div className="h-64 flex items-center justify-center text-mist text-sm">
          No holdings to allocate yet.
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <span className="label-eyebrow">Asset allocation</span>
      <div className="h-64 mt-2">
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

export default AllocationChart;