import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getMarket,
  searchStocks,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../services/stockService';
import { usePortfolio } from '../hooks/usePortfolio';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar/SearchBar';
import StockCard from '../components/StockCard/StockCard';
import BuySellModal from '../components/BuySellModal/BuySellModal';
import ErrorCard from '../components/ErrorCard/ErrorCard';
import EmptyState from '../components/EmptyState/EmptyState';
import { CardGridSkeleton } from '../components/Skeleton/Skeleton';

const Market = () => {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [tradeStock, setTradeStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY');
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search.trim(), 350);
  const isSearching = debouncedSearch.length > 0;

  const {
    data: browseData,
    isLoading: browseLoading,
    isError: browseError,
    error: browseErrorObj,
    refetch: refetchBrowse,
  } = useQuery({
    queryKey: ['market', sector],
    queryFn: () => getMarket({ sector }),
    enabled: !isSearching,
  });

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
    error: searchErrorObj,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['market', 'search', debouncedSearch],
    queryFn: () => searchStocks(debouncedSearch),
    enabled: isSearching,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist', 'preview'],
    queryFn: getWatchlist,
  });
  const { data: portfolioData } = usePortfolio();

  const watchedSymbols = new Set((watchlistData?.stocks || []).map((s) => s.symbol));

  const toggleWatch = async (symbol) => {
    const wasWatched = watchedSymbols.has(symbol);
    try {
      if (wasWatched) {
        await removeFromWatchlist(symbol);
        toast.success(`${symbol} removed from watchlist`);
      } else {
        await addToWatchlist(symbol);
        toast.success(`${symbol} added to watchlist`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update your watchlist');
    }
  };

  const ownedQuantity = (symbol) =>
    portfolioData?.holdings?.find((h) => h.stockSymbol === symbol)?.quantity || 0;

  const stocks = isSearching ? searchData?.results || [] : browseData?.stocks || [];
  const isLoading = isSearching ? searchLoading : browseLoading;
  const isFetchingMore = isSearching && searchFetching && !searchLoading;
  const isError = isSearching ? searchError : browseError;
  const errorMessage = isSearching
    ? searchErrorObj?.response?.data?.message || 'Search failed. Please try again.'
    : browseErrorObj?.response?.data?.message || 'Could not load the market. Please try again.';
  const retry = isSearching ? refetchSearch : refetchBrowse;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Market</h1>
        <p className="text-mist text-sm mt-1">
          {isSearching
            ? 'Live results from Yahoo Finance.'
            : 'Live-simulated prices across a curated set of stocks.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search any stock symbol or company…"
          />
        </div>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          disabled={isSearching}
          className="input-field sm:w-56 disabled:opacity-50"
          title={isSearching ? 'Sector filter only applies to the curated browse view' : undefined}
        >
          <option value="All">All sectors</option>
          {(browseData?.sectors || []).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={8} />
      ) : isError ? (
        <ErrorCard message={errorMessage} onRetry={retry} />
      ) : stocks.length ? (
        <>
          {isFetchingMore && <p className="text-xs text-mist -mt-2">Refreshing results…</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isWatched={watchedSymbols.has(stock.symbol)}
                onToggleWatch={toggleWatch}
                onTrade={(s, mode) => {
                  setTradeStock(s);
                  setTradeMode(mode);
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          size="sm"
          message={isSearching ? `No results for "${debouncedSearch}".` : 'No stocks match your filters.'}
        />
      )}

      {tradeStock && (
        <BuySellModal
          stock={tradeStock}
          mode={tradeMode}
          walletBalance={portfolioData?.walletBalance}
          ownedQuantity={ownedQuantity(tradeStock.symbol)}
          onClose={() => setTradeStock(null)}
        />
      )}
    </div>
  );
};

export default Market;