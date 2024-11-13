// api-client.js
import axios from "axios";

// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // URL cơ sở từ biến môi trường
  withCredentials: true, // Gửi cookie cùng với các yêu cầu
});

let isRefreshing = false; // Biến để kiểm tra xem có đang làm mới token không
let failedQueue = []; // Hàng đợi các yêu cầu bị lỗi do token hết hạn

/**
 * Xử lý hàng đợi các yêu cầu bị lỗi
 * @param {Object} error - Lỗi xảy ra
 * @param {string|null} token - Token mới (nếu có)
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Từ chối lời hứa nếu có lỗi
    } else {
      prom.resolve(token); // Giải quyết lời hứa với token mới
    }
  });
  failedQueue = []; // Xóa hàng đợi sau khi xử lý
};

// Interceptor cho các yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Thêm token vào header Authorization
    }
    return config; // Trả về cấu hình yêu cầu đã được chỉnh sửa
  },
  (error) => Promise.reject(error) // Xử lý lỗi yêu cầu
);

// Interceptor cho các phản hồi
apiClient.interceptors.response.use(
  (response) => response, // Trả về phản hồi nếu không có lỗi
  async (error) => {
    const originalRequest = error.config; // Lưu lại yêu cầu gốc

    // Kiểm tra nếu lỗi là 401 (Unauthorized) và yêu cầu chưa được thử lại
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang làm mới token, thêm yêu cầu vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`; // Thêm token mới vào header Authorization
            return apiClient(originalRequest); // Gửi lại yêu cầu gốc với token mới
          })
          .catch((err) => Promise.reject(err)); // Xử lý lỗi nếu có
      }

      originalRequest._retry = true; // Đánh dấu yêu cầu đã được thử lại
      isRefreshing = true; // Đặt cờ đang làm mới token

      try {
        const response = await apiClient.get("/user/refreshToken"); // Gửi yêu cầu làm mới token
        const { accessToken } = response.data; // Lấy token mới từ phản hồi

        localStorage.setItem("accessToken", accessToken); // Lưu token mới vào localStorage
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`; // Thêm token mới vào header mặc định

        originalRequest.headers.Authorization = `Bearer ${accessToken}`; // Thêm token mới vào header của yêu cầu gốc
        processQueue(null, accessToken); // Xử lý hàng đợi với token mới

        return apiClient(originalRequest); // Gửi lại yêu cầu gốc với token mới
      } catch (refreshError) {
        processQueue(refreshError, null); // Xử lý hàng đợi với lỗi làm mới token
        localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
        window.location.href = "/login"; // Chuyển hướng người dùng đến trang đăng nhập
        return Promise.reject(refreshError); // Từ chối lời hứa với lỗi làm mới token
      } finally {
        isRefreshing = false; // Đặt lại cờ làm mới token
      }
    }

    return Promise.reject(error); // Từ chối lời hứa với lỗi ban đầu
  }
);

export default apiClient; // Xuất apiClient để sử dụng trong các phần khác của ứng dụng
