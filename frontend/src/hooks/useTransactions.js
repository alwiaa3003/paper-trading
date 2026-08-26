import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../services/portfolioService';

export const useTransactions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    ...options,
  });
};