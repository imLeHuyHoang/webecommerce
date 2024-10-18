import React, { createContext, useState, useEffect, useContext } from "react";
import api from "./api";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/api/user/me");
      setAuth({
        isAuthenticated: true,
        user: response.data,
      });
    } catch (error) {
      setAuth({ isAuthenticated: false, user: null });
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      checkAuthStatus();
    }
  }, []);

  const login = async (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    await checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
