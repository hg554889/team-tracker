// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 토큰 자동 헤더 적용
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 인증 API
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const fetchMe = () => api.get('/auth/me');
export const logout = () => api.get('/auth/logout');

// 팀 API
export const fetchTeams = () => api.get('/teams');
export const fetchTeam = (id) => api.get(`/teams/${id}`);
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const addTeamMember = (id, data) => api.post(`/teams/${id}/members`, data);
export const removeTeamMember = (id, userId) => api.delete(`/teams/${id}/members/${userId}`);

// 보고서 API
export const fetchReports = () => api.get('/reports');
export const fetchTeamReports = (teamId) => api.get(`/reports/teams/${teamId}/reports`);
export const createReport = (teamId, data) => api.post(`/reports/teams/${teamId}/reports`, data);
export const fetchReport = (id) => api.get(`/reports/${id}`);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

export default api;