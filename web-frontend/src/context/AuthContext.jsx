// AuthContext.js (Frontend)
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
    isLoading: true,
  });
  const navigate = useNavigate();

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
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setAuth({ user: null, accessToken: null, isLoading: false });
  }, []);

  // Token refresh mechanism
  useEffect(() => {
    let refreshInterval;

    const refreshToken = async () => {
      try {
        const response = await apiClient.get("/user/refreshToken");
        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        setAuth((prev) => ({
          ...prev,
          accessToken,
        }));
      } catch (error) {
        console.error("Token refresh error:", error);
        clearAuthData();
        navigate("/login");
      }
    };

    if (auth.accessToken) {
      refreshInterval = setInterval(refreshToken, 10 * 60 * 1000); // 10 minutes

      // Initial refresh
      refreshToken();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [auth.accessToken, clearAuthData, navigate]);

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
      navigate("/login");
    }
  }, [clearAuthData, navigate]);

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
