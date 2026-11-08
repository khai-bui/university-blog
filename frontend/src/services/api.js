import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự gắn token vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Hết hạn token (401) thì xóa phiên và về trang đăng nhập,
// trừ các request đăng nhập/đăng ký để form còn hiện được lỗi
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;