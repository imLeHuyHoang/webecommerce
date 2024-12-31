import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../utils/api-client";

export const useAuthStatus = () => {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const { logout } = useContext(AuthContext);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.get("/user/me");
      setAuth({ isAuthenticated: true, user: response.data });
    } catch (error) {
      setAuth({ isAuthenticated: false, user: null });
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuthStatus();
    }
  }, []);

  return { auth, setAuth, checkAuthStatus };
};
