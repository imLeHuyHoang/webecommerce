// src/utils/axiosClient.js

import axios from "axios";

// Tạo một Axios client với cấu hình sẵn
const apiClient = axios.create({
  baseURL: "http://localhost:5000/", // Địa chỉ API backend
  timeout: 10000, // Thời gian tối đa cho mỗi request
  headers: {
    "Content-Type": "application/json", // Định dạng dữ liệu JSON
  },
});

// Thêm token vào request nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; // Thêm token vào header
  }
  return config;
});

// Xử lý lỗi và tự động refresh token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử lại
      try {
        // Gọi API refresh token
        const { data } = await apiClient.post("/user/refresh_token");
        localStorage.setItem("accessToken", data.accessToken); // Cập nhật token mới
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest); // Thử lại request ban đầu
      } catch (refreshError) {
        return Promise.reject(refreshError); // Báo lỗi nếu refresh thất bại
      }
    }
    return Promise.reject(error); // Báo lỗi nếu không phải lỗi 401
  }
);

export default apiClient;
