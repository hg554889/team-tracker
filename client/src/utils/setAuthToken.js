// client/src/utils/setAuthToken.js
import api from '../services/api';

function setAuthToken(token) {
  if (token) {
    // Apply authorization token to every request if logged in
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Set token in localStorage
    localStorage.setItem('token', token);
  } else {
    // Delete auth header
    delete api.defaults.headers.common['Authorization'];
    // Remove token from localStorage
    localStorage.removeItem('token');
  }
}

export default setAuthToken;