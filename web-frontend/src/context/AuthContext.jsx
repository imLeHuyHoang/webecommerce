// src/context/AuthContext.js
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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      }
    };

    initializeAuth();
  }, [clearAuthData]);

  // Refresh Token Mechanism
  useEffect(() => {
    let refreshInterval;

    const refreshToken = async () => {
      try {
        const response = await apiClient.get("/user/refreshToken");
        const { accessToken, user } = response.data;

        if (accessToken && user) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          setAuth((prev) => ({
            ...prev,
            accessToken,
            user,
          }));
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        clearAuthData();
        // Optionally, navigate to login or show a notification
      }
    };

    if (auth.accessToken) {
      refreshInterval = setInterval(refreshToken, 10 * 60 * 1000); // 10 minutes
      // Refresh immediately upon setting accessToken
      refreshToken();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [auth.accessToken, clearAuthData]);

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
      // Navigation handled by the component invoking logout
    }
  }, [clearAuthData]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        clearAuthData,
      }}
    >
      {!auth.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
