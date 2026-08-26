import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useTransactions } from '../hooks/useTransactions';
import { useDebounce } from '../hooks/useDebounce';

import TransactionTable from '../components/TransactionTable/TransactionTable';
import SearchBar from '../components/SearchBar/SearchBar';

import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import { TableSkeleton } from '../components/Skeleton/Skeleton';

const Transactions = () => {
  const queryClient = useQueryClient();

  const [type, setType] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 350);

  const {
    data,
    isLoading,
    isError,
  } = useTransactions({
    type,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    page,
    limit: 15,
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }

    setPage(1);
  };

  const exportCSV = () => {
    const rows = data?.transactions || [];

    if (!rows.length) {
      toast.error('No transactions available.');
      return;
    }

    const header =
      'Date,Symbol,Type,Quantity,Price,Total\n';

    const body = rows
      .map(
        (tx) =>
          `${new Date(tx.createdAt).toISOString()},${tx.stockSymbol},${tx.transactionType},${tx.quantity},${tx.price},${tx.totalAmount}`
      )
      .join('\n');

    const blob = new Blob([header + body], {
      type: 'text/csv',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'transactions.csv';
    a.click();

    URL.revokeObjectURL(url);

    toast.success('Transactions exported successfully.');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="animate-pulse h-8 w-48 rounded bg-panel2 mb-2" />
          <div className="animate-pulse h-4 w-72 rounded bg-panel2" />
        </div>

        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        message="Couldn't load your transactions."
        onRetry={() =>
          queryClient.invalidateQueries({
            queryKey: ['transactions'],
          })
        }
      />
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>
          <h1 className="font-display text-2xl font-semibold">
            Transactions
          </h1>

          <p className="text-mist text-sm mt-1">
            Your complete trading history.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={!transactions.length}
          className="btn-ghost text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>

      </div>

      <div className="flex flex-col md:flex-row gap-3">

        <div className="flex-1">
          <SearchBar
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              setPage(1);
            }}
            placeholder="Search by symbol or company..."
          />
        </div>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="input-field md:w-48"
        >
          <option value="ALL">All Types</option>
          <option value="BUY">Buy Only</option>
          <option value="SELL">Sell Only</option>
        </select>
      </div>
            {transactions.length === 0 ? (
        <EmptyState
          message="You haven't made any transactions yet."
          actionLabel="Browse Market"
          actionTo="/market"
        />
      ) : (
        <>
          <TransactionTable
            transactions={transactions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {data?.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">

              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="btn-ghost px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-mist">
                Page {data.page} of {data.pages}
              </span>

              <button
                disabled={page >= data.pages}
                onClick={() => setPage((prev) => prev + 1)}
                className="btn-ghost px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>

            </div>
          )}

          <div className="flex justify-center">
            <p className="text-xs text-mist">
              Showing{' '}
              <span className="font-semibold text-paper">
                {transactions.length}
              </span>{' '}
              transaction
              {transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;