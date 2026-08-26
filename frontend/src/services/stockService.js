import api from './api';

export const getMarket = async ({ sector, search } = {}) => {
  const { data } = await api.get('/stocks', { params: { sector, search } });
  return data;
};

export const getStockDetails = async (symbol) => {
  const { data } = await api.get(`/stocks/${symbol}`);
  return data;
};

export const getStockHistory = async (symbol, range = '1M') => {
  const { data } = await api.get(`/stocks/${symbol}/history`, { params: { range } });
  return data;
};

export const getWatchlist = async () => {
  const { data } = await api.get('/watchlist');
  return data;
};

export const getLeaderboard = async (sortBy = 'portfolioValue') => {
  const { data } = await api.get('/leaderboard', { params: { sortBy } });
  return data;
};

export const searchStocks = async (query) => {
  const { data } = await api.get('/stocks/search', { params: { q: query } });
  return data;
};

export const addToWatchlist = async (symbol) => {
  const { data } = await api.post('/watchlist', { symbol });
  return data;
};

export const removeFromWatchlist = async (symbol) => {
  const { data } = await api.delete(`/watchlist/${symbol}`);
  return data;
};

