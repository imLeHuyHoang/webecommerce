import axios from "axios";

// Cấu hình baseURL và các tùy chọn mặc định
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Địa chỉ API của bạn
  withCredentials: true, // Cho phép gửi cookie và credentials
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để bắt và xử lý lỗi từ API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
