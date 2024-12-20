import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../utils/api-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setAuth({ user: null, accessToken: null, isLoading: false });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setAuth({
        user: JSON.parse(storedUser),
        accessToken: storedToken,
        isLoading: false,
      });
    } else {
      setAuth((prev) => ({ ...prev, isLoading: false }));
    }
  }, [clearAuthData]);

  const login = useCallback((user, accessToken) => {
    if (user && accessToken) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      setAuth({
        user,
        accessToken,
        isLoading: false,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/user/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, clearAuthData }}>
      {!auth.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
