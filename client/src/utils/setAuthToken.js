// client/src/utils/setAuthToken.js
import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    // 모든 axios 요청에 토큰을 기본 헤더로 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // 토큰이 없으면 Authorization 헤더 제거
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;