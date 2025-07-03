// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import setAuthToken from '../utils/setAuthToken';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useAlert();

  // 유저 정보 fetch
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setAuthToken(token);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUser(data.data);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.data);
    setAlert('로그인되었습니다!', 'success');
  };

  const register = async (form) => {
    const res = await apiRegister(form);
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.data);
    setAlert('회원가입이 완료되었습니다!', 'success');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setAlert('로그아웃되었습니다.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};