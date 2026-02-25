import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const errorMessage = error.response?.data?.message || '';
      
      // Don't intercept EMAIL_NOT_VERIFIED — let the login page handle the redirect
      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        return Promise.reject(error);
      }

      // Prevent multiple redirects from concurrent 401 responses
      isRedirecting = true;

      const isSessionExpired = errorMessage.includes('Session expired') || 
                               errorMessage.includes('logged in from another device');
      
      // Clear all auth state to prevent re-auth loop
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      
      if (isSessionExpired) {
        // Store a flag to show session expired message on login page
        sessionStorage.setItem('sessionExpired', 'true');
      }
      
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
