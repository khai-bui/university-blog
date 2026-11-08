import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const saveAuth = (data) => {
    localStorage.setItem('token', data.token);
    const u = { username: data.username, role: data.role };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    saveAuth(res.data);
  };

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    saveAuth(res.data);
  };

  const socialLogin = async (provider, token) => {
    const res = await api.post(`/api/auth/${provider}`, { token });
    saveAuth(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, socialLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);