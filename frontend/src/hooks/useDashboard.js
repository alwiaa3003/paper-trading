import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboardService';

export const useDashboard = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    refetchInterval: 15000,
    ...options,
  });
};