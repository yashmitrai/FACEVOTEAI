import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Match Flask backend port exactly
});

// Axios Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Phase 7: Explicitly allow proper JSON passing
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, explicitly push user out
      localStorage.removeItem('jwt_token');
      // If we are strictly on admin, force boot.
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
         window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
