// src/hooks/useAuthStatus.js

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../utils/api-client";

// Hook tùy chỉnh để kiểm tra trạng thái đăng nhập
export const useAuthStatus = () => {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const { logout } = useContext(AuthContext); // Lấy hàm logout từ context

  // Kiểm tra trạng thái người dùng
  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.get("/user/me"); // Gọi API lấy thông tin người dùng
      setAuth({ isAuthenticated: true, user: response.data }); // Cập nhật trạng thái
    } catch (error) {
      setAuth({ isAuthenticated: false, user: null }); // Nếu lỗi, đặt lại trạng thái
      logout(); // Thực hiện logout nếu cần
    }
  };

  // Kiểm tra trạng thái khi component được mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuthStatus(); // Gọi hàm kiểm tra trạng thái
    }
  }, []);

  return { auth, setAuth, checkAuthStatus }; // Trả về trạng thái và các hàm liên quan
};
