import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = []; // Hàng đợi các yêu cầu bị lỗi do token hết hạn

// Hàm xử lý hàng đợi các yêu cầu bị lỗi
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = []; // Xóa hàng đợi sau khi xử lý xong
};

// Thiết lập interceptor cho các yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Thêm token vào header của yêu cầu
    }
    return config;
  },
  (error) => Promise.reject(error) // Xử lý lỗi yêu cầu
);

// Thiết lập interceptor cho các phản hồi
apiClient.interceptors.response.use(
  (response) => response, // Trả về phản hồi nếu không có lỗi
  async (error) => {
    const originalRequest = error.config; // Lưu lại yêu cầu gốc
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra lỗi 401 và yêu cầu chưa được thử lại
      if (isRefreshing) {
        // Nếu token đang được làm mới, thêm yêu cầu vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`; // Thêm token mới vào header của yêu cầu gốc
            return apiClient(originalRequest); // Thử lại yêu cầu gốc
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true; // Đánh dấu yêu cầu đã được thử lại
      isRefreshing = true; // Đặt biến làm mới token thành true

      try {
        const response = await apiClient.get("/user/refreshToken"); // Gửi yêu cầu làm mới token
        const { accessToken, user } = response.data;

        if (accessToken && user) {
          // Lưu token và thông tin người dùng mới vào localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`; // Cập nhật token mới cho các yêu cầu tiếp theo
          originalRequest.headers.Authorization = `Bearer ${accessToken}`; // Thêm token mới vào header của yêu cầu gốc
          processQueue(null, accessToken); // Xử lý hàng đợi với token mới
          return apiClient(originalRequest); // Thử lại yêu cầu gốc
        } else {
          throw new Error("Invalid refresh token response"); // Ném lỗi nếu phản hồi làm mới token không hợp lệ
        }
      } catch (err) {
        processQueue(err, null); // Xử lý hàng đợi với lỗi
        localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
        localStorage.removeItem("user"); // Xóa thông tin người dùng khỏi localStorage
        return Promise.reject(err); // Từ chối yêu cầu với lỗi
      } finally {
        isRefreshing = false; // Đặt biến làm mới token thành false
      }
    }

    return Promise.reject(error); // Từ chối yêu cầu với lỗi ban đầu
  }
);

export default apiClient; // Xuất đối tượng apiClient để sử dụng trong các phần khác của ứng dụng
