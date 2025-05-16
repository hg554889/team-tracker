// client/src/components/routing/PrivateRoute.js

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';
import Sidebar from '../layout/Sidebar';

// 인증된 사용자만 접근 가능한 라우트
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // 로딩 중일 경우 스피너 표시
  if (loading) {
    return <Spinner />;
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 원래 컴포넌트와 사이드바 렌더링
  return (
    <>
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </>
  );
};

export default PrivateRoute;