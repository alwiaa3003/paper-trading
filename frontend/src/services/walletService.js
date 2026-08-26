import { getPortfolio } from './portfolioService';

// Wallet balance is returned alongside the portfolio snapshot, so this
// service simply exposes a focused accessor for components that only
// care about cash on hand.
export const getWalletBalance = async () => {
  const { walletBalance } = await getPortfolio();
  return walletBalance;
};
