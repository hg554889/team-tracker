// client/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import setAuthToken from '../utils/setAuthToken';

// 초기 상태
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  user: null,
  loading: true,
  error: null
};

// 컨텍스트 생성
export const AuthContext = createContext(initialState);

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  // 토큰이 있을 경우 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);

        try {
          const res = await api.get('/auth/me');

          setState({
            ...state,
            isAuthenticated: true,
            user: res.data.data,
            loading: false
          });
        } catch (err) {
          console.error('Failed to load user:', err.message);
          localStorage.removeItem('token');
          setAuthToken(null);
          setState({
            ...state,
            token: null,
            isAuthenticated: false,
            user: null,
            loading: false,
            error: '인증 실패. 다시 로그인하세요.'
          });
        }
      } else {
        setState({
          ...state,
          loading: false
        });
      }
    };

    loadUser();
    // eslint-disable-next-line
  }, []);

  // 회원가입
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setState({
        ...state,
        token: res.data.token,
        isAuthenticated: true,
        user: res.data.data,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response && err.response.data ? err.response.data.error : '회원가입 오류'
      };
    }
  };

  // 로그인
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setState({
        ...state,
        token: res.data.token,
        isAuthenticated: true,
        user: res.data.data,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response && err.response.data ? err.response.data.error : '로그인 오류'
      };
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    
    setState({
      ...state,
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  // 사용자 정보 갱신
  const updateUserInfo = (newUserInfo) => {
    setState({
      ...state,
      user: { ...state.user, ...newUserInfo }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        updateUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};