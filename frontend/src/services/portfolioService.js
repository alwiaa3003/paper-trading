import api from './api';

export const getPortfolio = async () => {
  const { data } = await api.get('/portfolio');
  return data;
};

export const getPortfolioGrowth = async (params = {}) => {
  const { data } = await api.get('/portfolio/growth', { params });
  return data;
};

export const buyStock = async ({ symbol, quantity }) => {
  const { data } = await api.post('/transactions/buy', { symbol, quantity });
  return data;
};

export const sellStock = async ({ symbol, quantity }) => {
  const { data } = await api.post('/transactions/sell', { symbol, quantity });
  return data;
};

export const getTransactions = async (params = {}) => {
  const { data } = await api.get('/transactions', { params });
  return data;
};