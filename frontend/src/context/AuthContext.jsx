import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bba_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('bba_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setUser(data.user);
    localStorage.setItem('bba_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (fields) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(fields),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bba_user');
  }, []);

  const deleteAccount = useCallback(async () => {
    const res = await fetch('/api/auth/delete', {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Deletion failed');

    setUser(null);
    localStorage.removeItem('bba_user');
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
