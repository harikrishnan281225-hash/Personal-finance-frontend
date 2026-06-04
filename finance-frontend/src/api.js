import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Request interceptor to attach the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Request sent with Token:", token.substring(0, 20) + "..."); // Added for debugging
  } else {
    console.warn("No token found in localStorage!");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add logging to identify the exact error
    if (error.response) {
      console.error(`API Error (${error.response.status}):`, error.response.data);
      
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn("Unauthorized/Forbidden. Redirecting to login...");
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;