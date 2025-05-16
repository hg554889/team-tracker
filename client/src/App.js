// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import PrivateRoute from './components/routing/PrivateRoute';

// 레이아웃 컴포넌트
import Header from './components/layout/Header';
import Alert from './components/layout/Alert';
import Sidebar from './components/layout/Sidebar';

// 인증 페이지
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// 대시보드 페이지
import Dashboard from './pages/dashboard/Dashboard';

// 팀 관련 페이지
import Teams from './pages/teams/Teams';
import TeamDetails from './pages/teams/TeamDetails';
import CreateTeam from './pages/teams/CreateTeam';
import EditTeam from './pages/teams/EditTeam';

// 보고서 관련 페이지
import Reports from './pages/reports/Reports';
import ReportDetails from './pages/reports/ReportDetails';
import CreateReport from './pages/reports/CreateReport';
import EditReport from './pages/reports/EditReport';

// 스타일 임포트
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="app">
            <Header />
            <Alert />
            <div className="main-container">
              <Sidebar />
              <div className="content-container">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/" element={<PrivateRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    
                    {/* 팀 라우트 */}
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/teams/create" element={<CreateTeam />} />
                    <Route path="/teams/:id" element={<TeamDetails />} />
                    <Route path="/teams/:id/edit" element={<EditTeam />} />
                    
                    {/* 보고서 라우트 */}
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/teams/:teamId/reports/create" element={<CreateReport />} />
                    <Route path="/reports/:id" element={<ReportDetails />} />
                    <Route path="/reports/:id/edit" element={<EditReport />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;