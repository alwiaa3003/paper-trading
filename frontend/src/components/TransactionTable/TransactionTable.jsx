import { LuChevronUp, LuChevronDown, LuChevronsUpDown } from 'react-icons/lu';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const SortIcon = ({ active, direction }) => {
  if (!active) return <LuChevronsUpDown size={13} className="text-mist/50" />;
  return direction === 'asc' ? <LuChevronUp size={13} /> : <LuChevronDown size={13} />;
};

// Renders a plain header when onSort isn't provided, so this component
// still works exactly as before if used anywhere without sorting wired up.
const SortableHeader = ({ sortKey, align = 'left', sortBy, sortOrder, onSort, children }) => (
  <th className={`px-4 py-3 font-medium label-eyebrow ${align === 'right' ? 'text-right' : 'text-left'}`}>
    {onSort ? (
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-paper transition-colors ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        {children}
        <SortIcon active={sortBy === sortKey} direction={sortOrder} />
      </button>
    ) : (
      children
    )}
  </th>
);

const TransactionTable = ({ transactions = [], sortBy, sortOrder, onSort }) => {
  if (!transactions.length) {
    return (
      <div className="card p-8 text-center text-mist">
        No transactions yet. Place your first order from the Market page.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-line text-left text-mist">
            <SortableHeader sortKey="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
              Date
            </SortableHeader>
            <SortableHeader sortKey="stockSymbol" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
              Symbol
            </SortableHeader>
            <th className="px-4 py-3 font-medium label-eyebrow">Type</th>
            <SortableHeader sortKey="quantity" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
              Qty
            </SortableHeader>
            <SortableHeader sortKey="price" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
              Price
            </SortableHeader>
            <SortableHeader sortKey="totalAmount" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
              Total
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-mist whitespace-nowrap">{formatDate(tx.createdAt)}</td>
              <td className="px-4 py-3 font-mono font-medium">{tx.stockSymbol}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tx.transactionType === 'BUY' ? 'bg-gain/15 text-gain' : 'bg-loss/15 text-loss'
                  }`}
                >
                  {tx.transactionType}
                </span>
              </td>
              <td className="px-4 py-3 text-right stat-tick">{tx.quantity}</td>
              <td className="px-4 py-3 text-right stat-tick">{formatCurrency(tx.price)}</td>
              <td className="px-4 py-3 text-right stat-tick font-semibold">
                {formatCurrency(tx.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;