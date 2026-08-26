import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { removeFromWatchlist } from '../services/stockService';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePortfolio } from '../hooks/usePortfolio';

import WatchlistCard from '../components/WatchlistCard/WatchlistCard';
import BuySellModal from '../components/BuySellModal/BuySellModal';

import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import { CardGridSkeleton } from '../components/Skeleton/Skeleton';

const Watchlist = () => {
  const queryClient = useQueryClient();

  const [tradeStock, setTradeStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');

  const {
    data,
    isLoading,
    isError,
  } = useWatchlist();

  const { data: portfolioData } = usePortfolio();

  const removeMutation = useMutation({
    mutationFn: (symbol) => removeFromWatchlist(symbol),

    onSuccess: () => {
      toast.success('Removed from watchlist');

      queryClient.invalidateQueries({
        queryKey: ['watchlist'],
      });
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          'Could not remove stock. Please try again.'
      );
    },
  });

  const handleRemove = (symbol) => {
    removeMutation.mutate(symbol);
  };

  const handleTrade = (stock, mode) => {
    setTradeStock(stock);
    setTradeMode(mode);
  };

  const ownedQuantity = (symbol) =>
    portfolioData?.holdings?.find(
      (holding) => holding.stockSymbol === symbol
    )?.quantity || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="animate-pulse h-8 w-44 rounded bg-panel2 mb-2" />
          <div className="animate-pulse h-4 w-72 rounded bg-panel2" />
        </div>

        <CardGridSkeleton
          count={8}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        message="Couldn't load your watchlist. Please try again."
        onRetry={() =>
          queryClient.invalidateQueries({
            queryKey: ['watchlist'],
          })
        }
      />
    );
  }

  const stocks = data?.stocks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Watchlist
        </h1>

        <p className="text-mist text-sm mt-1">
          Stocks you're keeping an eye on.
        </p>
      </div>

      {stocks.length === 0 ? (
        <EmptyState
          message="Your watchlist is empty."
          actionLabel="Browse the market"
          actionTo="/market"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stocks.map((stock) => (
            <WatchlistCard
              key={stock.symbol}
              stock={stock}
              onRemove={handleRemove}
              onTrade={handleTrade}
              isRemoving={
                removeMutation.isPending &&
                removeMutation.variables === stock.symbol
              }
            />
          ))}
        </div>
      )}
            {tradeStock && (
        <BuySellModal
          stock={tradeStock}
          mode={tradeMode}
          walletBalance={portfolioData?.walletBalance}
          ownedQuantity={ownedQuantity(tradeStock.symbol)}
          onClose={() => {
            setTradeStock(null);
            setTradeMode('BUY');
          }}
        />
      )}

      {removeMutation.isPending && (
        <p className="text-xs text-mist text-center">
          Updating your watchlist...
        </p>
      )}

      <div className="text-center text-xs text-mist/70">
        {stocks.length > 0 && (
          <>
            Watching{' '}
            <span className="font-semibold text-paper">
              {stocks.length}
            </span>{' '}
            stock{stocks.length === 1 ? '' : 's'}
          </>
        )}
      </div>
    </div>
  );
};

export default Watchlist;