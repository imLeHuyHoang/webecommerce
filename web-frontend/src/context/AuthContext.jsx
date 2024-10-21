import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setAuth({ user: JSON.parse(storedUser) });
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setAuth({ user });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    setAuth({ user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
