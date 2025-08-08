// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';

// 인증 페이지들
import Login from './pages/Login';
import Register from './pages/Register';

// 새로 생성한 페이지들
import Dashboard from './pages/Dashboard';
import TeamCreate from './pages/TeamCreate';
import TeamEdit from './pages/TeamEdit';
import ReportCreate from './pages/ReportCreate';

// 기존에 있던 페이지들 (올바른 경로로 수정)
import Teams from './pages/teams/Teams';
import TeamDetails from './pages/teams/TeamDetails';
import ReportList from './pages/ReportList';
import ReportDetails from './pages/reports/ReportDetails';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AlertProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
                <Route path="/teams/create" element={<PrivateRoute><TeamCreate /></PrivateRoute>} />
                <Route path="/teams/:id/edit" element={<PrivateRoute><TeamEdit /></PrivateRoute>} />
                <Route path="/teams/:id" element={<PrivateRoute><TeamDetails /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><ReportList /></PrivateRoute>} />
                <Route path="/teams/:id/report/new" element={<PrivateRoute><ReportCreate /></PrivateRoute>} />
                <Route path="/reports/:id" element={<PrivateRoute><ReportDetails /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;