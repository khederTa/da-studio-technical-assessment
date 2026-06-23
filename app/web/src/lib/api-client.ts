import axios from 'axios';

function apiOrigin(): string {
  if (import.meta.env.DEV) {
    return '';
  }
  return (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
}

const baseURL = `${apiOrigin()}/api`;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  },
);

export default api;
