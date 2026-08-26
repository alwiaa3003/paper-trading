import { useQuery } from '@tanstack/react-query';
import { getPortfolio } from '../services/portfolioService';

export const usePortfolio = (options = {}) => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    refetchInterval: 15000,
    ...options,
  });
};
