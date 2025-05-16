// client/src/utils/setAuthToken.js

import api from '../services/api';

// axios 인스턴스의 기본 헤더에 인증 토큰 설정
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;