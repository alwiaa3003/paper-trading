import { useQuery } from '@tanstack/react-query';
import { getPortfolioGrowth } from '../services/portfolioService';

export const usePortfolioGrowth = (range = '1M', options = {}) => {
  return useQuery({
    queryKey: ['portfolio', 'growth', range],
    queryFn: () => getPortfolioGrowth({ range }),
    ...options,
  });
};