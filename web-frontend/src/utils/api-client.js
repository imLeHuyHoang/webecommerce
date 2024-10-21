import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Để gửi cookie chứa refresh token
});

// Interceptor để tự động refresh token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.get(
          "http://localhost:5000/api/user/refreshToken",
          { withCredentials: true }
        );
        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken); // Lưu token mới

        // Gửi lại yêu cầu với token mới
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập nếu refresh thất bại
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
