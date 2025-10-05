import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});
console.log(process.env.REACT_APP_API_URL)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    // For example, auto-logout on 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;