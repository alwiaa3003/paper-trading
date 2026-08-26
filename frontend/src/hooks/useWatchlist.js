import { useQuery } from '@tanstack/react-query';
import { getWatchlist } from '../services/stockService';

export const useWatchlist = (options = {}) => {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    refetchInterval: 15000,
    ...options,
  });
};