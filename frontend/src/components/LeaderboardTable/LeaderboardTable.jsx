const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const medal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);

const Row = ({ row, pinned }) => (
  <tr
    className={`border-b border-line last:border-0 ${
      row.isCurrentUser ? 'bg-accent/10' : ''
    } ${pinned ? 'border-t-2 border-t-line' : ''}`}
  >
    <td className="px-4 py-3 font-mono">{medal(row.rank) || `#${row.rank}`}</td>
    <td className="px-4 py-3 font-medium">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-panel2 border border-line flex items-center justify-center text-xs shrink-0">
          {row.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="truncate">{row.name}</span>
        {row.isCurrentUser && <span className="text-xs text-accent font-normal shrink-0">(you)</span>}
      </div>
    </td>
    <td className="px-4 py-3 text-right stat-tick font-semibold">
      {formatCurrency(row.totalPortfolioValue)}
    </td>
    <td className={`px-4 py-3 text-right stat-tick ${row.totalProfitLoss >= 0 ? 'text-gain' : 'text-loss'}`}>
      {row.totalProfitLoss >= 0 ? '+' : ''}
      {formatCurrency(row.totalProfitLoss)}
    </td>
    <td className={`px-4 py-3 text-right stat-tick ${row.totalReturnPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
      {row.totalReturnPercent >= 0 ? '+' : ''}
      {row.totalReturnPercent?.toFixed(2)}%
    </td>
  </tr>
);

const LeaderboardTable = ({ top = [], currentUser = null }) => {
  const currentUserInTop = currentUser && top.some((row) => row.isCurrentUser);

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-mist">
            <th className="px-4 py-3 font-medium label-eyebrow">Rank</th>
            <th className="px-4 py-3 font-medium label-eyebrow">Investor</th>
            <th className="px-4 py-3 font-medium label-eyebrow text-right">Portfolio Value</th>
            <th className="px-4 py-3 font-medium label-eyebrow text-right">P/L</th>
            <th className="px-4 py-3 font-medium label-eyebrow text-right">Return</th>
          </tr>
        </thead>
        <tbody>
          {top.map((row) => (
            <Row key={row.id} row={row} />
          ))}
          {currentUser && !currentUserInTop && <Row key={currentUser.id} row={currentUser} pinned />}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;