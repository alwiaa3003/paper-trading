import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../services/stockService';

import LeaderboardTable from '../components/LeaderboardTable/LeaderboardTable';

import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import { TableSkeleton } from '../components/Skeleton/Skeleton';

const SORT_OPTIONS = [
  { value: 'totalPortfolioValue', label: 'Portfolio Value' },
  { value: 'totalProfitLoss', label: 'Profit' },
  { value: 'totalReturnPercent', label: 'Return %' },
];

const Leaderboard = () => {
  const [sortBy, setSortBy] = useState('totalPortfolioValue');

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard', sortBy],
    queryFn: () => getLeaderboard(sortBy),
    refetchInterval: 20000,
  });

  const leaderboard = data?.leaderboard || [];
  const top = leaderboard.slice(0, 20);
  const currentUser =
    leaderboard.find((row) => row.isCurrentUser) || null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="animate-pulse h-8 w-48 rounded bg-panel2 mb-2" />
          <div className="animate-pulse h-4 w-72 rounded bg-panel2" />
        </div>

        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        message="Couldn't load the leaderboard."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>
          <h1 className="font-display text-2xl font-semibold">
            Leaderboard
          </h1>

          <p className="text-mist text-sm mt-1">
            Top investors ranked by simulated performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-panel2 border border-line text-paper'
                  : 'text-mist hover:bg-panel2'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

      </div>

      {top.length === 0 ? (
        <EmptyState
          message="Leaderboard is currently empty."
        />
      ) : (
        <>
          <LeaderboardTable
            top={top}
            currentUser={currentUser}
          />

          <div className="flex justify-center">
            <p className="text-xs text-mist">
              Showing top{' '}
              <span className="font-semibold text-paper">
                {top.length}
              </span>{' '}
              investors
            </p>
          </div>
        </>
      )}

    </div>
  );
};

export default Leaderboard;