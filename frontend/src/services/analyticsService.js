import api from './api';

export const getAnalytics = async (range = '1M') => {
  const { data } = await api.get('/analytics', { params: { range } });
  return data;
};