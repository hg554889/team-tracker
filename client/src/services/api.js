// client/src/services/api.js
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 헤더 적용
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 자동 로그아웃
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

// ===================
// 인증 API 함수들
// ===================
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const fetchMe = () => api.get('/auth/me');
export const logout = () => api.get('/auth/logout');

// ===================
// 팀 API 함수들
// ===================
export const fetchTeams = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/teams${query ? `?${query}` : ''}`);
};

export const fetchTeam = (id) => api.get(`/teams/${id}`);

export const createTeam = (data) => api.post('/teams', data);

export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);

export const deleteTeam = (id) => api.delete(`/teams/${id}`);

export const addTeamMember = (teamId, memberData) => 
  api.post(`/teams/${teamId}/members`, memberData);

export const removeTeamMember = (teamId, userId) => 
  api.delete(`/teams/${teamId}/members/${userId}`);

export const getTeamMembers = (teamId) => 
  api.get(`/teams/${teamId}/members`);

// ===================
// 보고서 API 함수들
// ===================
export const fetchReports = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/reports${query ? `?${query}` : ''}`);
};

export const fetchReport = (id) => api.get(`/reports/${id}`);

export const createReport = (teamId, data) => 
  api.post(`/teams/${teamId}/reports`, data);

export const updateReport = (id, data) => api.put(`/reports/${id}`, data);

export const deleteReport = (id) => api.delete(`/reports/${id}`);

export const fetchTeamReports = (teamId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/teams/${teamId}/reports${query ? `?${query}` : ''}`);
};

// ===================
// 기여도 API 함수들
// ===================
export const fetchContributions = (reportId) => 
  api.get(`/reports/${reportId}/contributions`);

export const createContribution = (reportId, data) => 
  api.post(`/reports/${reportId}/contributions`, data);

export const updateContribution = (contributionId, data) => 
  api.put(`/contributions/${contributionId}`, data);

export const deleteContribution = (contributionId) => 
  api.delete(`/contributions/${contributionId}`);

// ===================
// 사용자 API 함수들 (관리자용)
// ===================
export const fetchUsers = () => api.get('/users');

export const fetchUser = (id) => api.get(`/users/${id}`);

export const updateUserRole = (id, role) => 
  api.put(`/users/${id}/role`, { role });

export const deleteUser = (id) => api.delete(`/users/${id}`);

// ===================
// 통계 API 함수들
// ===================
export const fetchDashboardStats = () => api.get('/stats/dashboard');

export const fetchTeamStats = (teamId) => api.get(`/stats/teams/${teamId}`);

export const fetchUserStats = (userId) => api.get(`/stats/users/${userId}`);

// ===================
// 파일 업로드 API 함수들
// ===================
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

// ===================
// 헬퍼 함수들
// ===================
export const isNetworkError = (error) => {
  return error.code === 'NETWORK_ERROR' || !error.response;
};

export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }

  return error.response?.data?.message || 
         error.response?.data?.error || 
         error.message || 
         '알 수 없는 오류가 발생했습니다.';
};

// ===================
// API 상태 확인
// ===================
export const checkApiHealth = () => api.get('/health');

// ===================
// 기본 export
// ===================
export default api;