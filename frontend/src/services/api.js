import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // The JWT lives in an httpOnly cookie set by the backend, so the browser
  // attaches it automatically — we just need to allow credentials on every
  // cross-origin request. There is no token for JS to read or store here,
  // which is what keeps it safe from XSS-based token theft.
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ledger_user');
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;