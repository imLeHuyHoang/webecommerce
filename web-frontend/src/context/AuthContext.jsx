// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: localStorage.getItem("accessToken") || null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setAuth((prev) => ({
          ...prev,
          user: JSON.parse(storedUser),
        }));
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await apiClient.get("/user/refreshToken");
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        setAuth((prev) => ({
          ...prev,
          accessToken,
        }));
      } catch {
        localStorage.removeItem("accessToken");
        setAuth((prev) => ({
          ...prev,
          accessToken: null,
          user: null,
        }));
        navigate("/login");
      }
    };

    const interval = setInterval(refreshToken, 600000); // Làm mới mỗi 10 phút
    return () => clearInterval(interval);
  }, []);

  const login = (user, accessToken) => {
    if (user && accessToken) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      setAuth({ user, accessToken });
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/user/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      setAuth({ user: null, accessToken: null });
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
