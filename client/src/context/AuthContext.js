// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { login as apiLogin, register as apiRegister, fetchMe } from '../services/api';
import setAuthToken from '../utils/setAuthToken';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useAlert();

  // 유저 정보 fetch - axios로 통일
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      setAuthToken(token);
      const response = await fetchMe(); // axios 사용
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('User fetch error:', error);
      // 토큰이 유효하지 않은 경우 제거
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setAuthToken(null);
      }
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        await fetchUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      
      if (response.data.success && response.data.token) {
        const { token, data: userData } = response.data;
        
        localStorage.setItem('token', token);
        setAuthToken(token);
        setUser(userData);
        
        if (setAlert) {
          setAlert('로그인되었습니다!', 'success');
        }
        
        return { success: true, user: userData };
      }
      
      throw new Error('로그인 응답이 올바르지 않습니다.');
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          '로그인에 실패했습니다.';
      
      if (setAlert) {
        setAlert(errorMessage, 'danger');
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (formData) => {
    try {
      const response = await apiRegister(formData);
      
      if (response.data.success && response.data.token) {
        const { token, data: userData } = response.data;
        
        localStorage.setItem('token', token);
        setAuthToken(token);
        setUser(userData);
        
        if (setAlert) {
          setAlert('회원가입이 완료되었습니다!', 'success');
        }
        
        return { success: true, user: userData };
      }
      
      throw new Error('회원가입 응답이 올바르지 않습니다.');
    } catch (error) {
      console.error('Register error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          '회원가입에 실패했습니다.';
      
      if (setAlert) {
        setAlert(errorMessage, 'danger');
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (선택적)
      await api.get('/auth/logout').catch(() => {
        // 로그아웃 요청이 실패해도 클라이언트에서는 처리
      });
    } catch (error) {
      console.error('Logout request error:', error);
    } finally {
      // 클라이언트 측 로그아웃 처리
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      
      if (setAlert) {
        setAlert('로그아웃되었습니다.', 'info');
      }
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const userData = await fetchUser();
      return userData;
    } catch (error) {
      console.error('User refresh error:', error);
      return null;
    }
  };

  // 사용자 권한 확인 헬퍼 함수들
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => hasRole('admin');
  const isExecutive = () => hasRole('executive');
  const isLeader = () => hasRole('leader');
  const isMember = () => hasRole('member');

  const canCreateTeam = () => {
    return hasAnyRole(['admin', 'executive', 'leader']);
  };

  const canManageTeam = (team) => {
    if (!user || !team) return false;
    return hasAnyRole(['admin', 'executive']) || team.leader?._id === user._id;
  };

  const isTeamMember = (team) => {
    if (!user || !team) return false;
    return team.leader?._id === user._id || 
           team.members?.some(member => member._id === user._id);
  };

  const value = {
    // 상태
    user,
    loading,
    
    // 인증 함수들
    login,
    register,
    logout,
    fetchUser,
    refreshUser,
    
    // 권한 확인 함수들
    hasRole,
    hasAnyRole,
    isAdmin,
    isExecutive,
    isLeader,
    isMember,
    canCreateTeam,
    canManageTeam,
    isTeamMember
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};