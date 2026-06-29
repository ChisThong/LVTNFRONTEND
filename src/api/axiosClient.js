import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://lvtnbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Tự động gắn Bearer token từ localStorage vào mỗi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
