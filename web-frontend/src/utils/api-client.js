// api-client.js
import axios from "axios";

// api-client.js

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Sử dụng import.meta.env cho biến Vite
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminAccessToken");
    const userToken = localStorage.getItem("accessToken");

    const token = adminToken || userToken;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshTokenEndpoint =
      originalRequest.url.includes("/refreshToken");

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshTokenEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/user/refreshToken`, // Sử dụng biến môi trường
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);

        apiClient.defaults.headers.common["Authorization"] =
          "Bearer " + accessToken;

        processQueue(null, accessToken);

        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
