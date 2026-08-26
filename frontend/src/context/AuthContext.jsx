import { createContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

// The JWT itself is never touched by this context — it lives in an httpOnly
// cookie the browser manages on its own. We only cache the (non-sensitive)
// user object in localStorage so the UI can render instantly on refresh
// instead of flashing a loading state; refreshUser() then re-validates
// against the cookie via GET /auth/me.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ledger_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (userData) => {
    localStorage.setItem('ledger_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    persistUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('ledger_user');
      setUser(null);
    }
  };

  // Called on mount (page load / refresh) to confirm the httpOnly cookie is
  // still valid and pull the freshest user data. If it fails (no cookie, or
  // an expired/invalid token), the user is signed out client-side.
  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      persistUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem('ledger_user');
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};