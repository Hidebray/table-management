import axios from 'axios';

const axiosClient = axios.create({
  // Backend server của bạn đang chạy ở port 5000 với prefix /api/admin
  baseURL: 'http://localhost:5000/api/admin', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Giúp bạn lấy thẳng data từ response mà không cần gõ .data nhiều lần
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    // Log lỗi gọn gàng
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;