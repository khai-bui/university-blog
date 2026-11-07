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
    const res = await api.post('/auth/login', { username, password });
    saveAuth(res.data);
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    saveAuth(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);