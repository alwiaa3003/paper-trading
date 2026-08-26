import { createContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const PortfolioContext = createContext(null);

// Portfolio, holdings and transaction data are fetched with React Query
// (see hooks/usePortfolio.js). This context just gives any component a way
// to say "the numbers changed, go refetch" after a buy/sell without prop
// drilling a callback down through the tree.
export const PortfolioProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const invalidatePortfolio = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['market'] });
  }, [queryClient]);

  return (
    <PortfolioContext.Provider value={{ invalidatePortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};
