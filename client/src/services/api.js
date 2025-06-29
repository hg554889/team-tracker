// client/src/services/api.js

import axios from 'axios';

// 기본 설정 값
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 응답 인터셉터 (오류 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error || '서버 오류가 발생했습니다',
      status: error.response?.status || 500
    };

    return Promise.reject(customError);
  }
);

export default api;
