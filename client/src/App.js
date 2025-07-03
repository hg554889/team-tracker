// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamCreate from './pages/TeamCreate';
import TeamEdit from './pages/TeamEdit';
import TeamDetails from './pages/TeamDetails';
import ReportList from './pages/ReportList';
import ReportCreate from './pages/ReportCreate';
import ReportDetails from './pages/ReportDetails';

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <Router>
          <Header />
          <Sidebar />
          <main className="main">
            <Alert />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
              <Route path="/teams/create" element={<PrivateRoute><TeamCreate /></PrivateRoute>} />
              <Route path="/teams/:id/edit" element={<PrivateRoute><TeamEdit /></PrivateRoute>} />
              <Route path="/teams/:id" element={<PrivateRoute><TeamDetails /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><ReportList /></PrivateRoute>} />
              <Route path="/teams/:id/report/new" element={<PrivateRoute><ReportCreate /></PrivateRoute>} />
              <Route path="/reports/:id" element={<PrivateRoute><ReportDetails /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;