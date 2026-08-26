import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const ProfitLossChart = ({ holdings }) => {
  const data = (holdings || []).map((h) => ({ name: h.stockSymbol, profitLoss: h.profitLoss }));

  return (
    <div className="card p-4">
      <span className="label-eyebrow">Profit / loss by holding</span>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#79766F' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DE',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(33,31,28,0.08)',
              }}
              formatter={(value) => [formatCurrency(value), 'P/L']}
            />
            <Bar dataKey="profitLoss" radius={[6, 6, 0, 0]}>
              {data.map((d, idx) => (
                <Cell key={idx} fill={d.profitLoss >= 0 ? '#1E8E5A' : '#D64545'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossChart;