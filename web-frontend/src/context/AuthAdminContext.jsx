import { createContext, useContext, useState, useEffect } from "react";

const AuthAdminContext = createContext();

export const AuthAdminProvider = ({ children }) => {
  const [authAdmin, setAuthAdmin] = useState({ admin: null, isLoading: true });

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      try {
        setAuthAdmin({ admin: JSON.parse(storedAdmin), isLoading: false });
      } catch (error) {
        console.error("Error parsing admin data:", error);
        localStorage.removeItem("admin");
        setAuthAdmin({ admin: null, isLoading: false });
      }
    } else {
      setAuthAdmin({ admin: null, isLoading: false });
    }
  }, []);

  const loginAdmin = (admin) => {
    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
      setAuthAdmin({ admin, isLoading: false });
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminAccessToken");
    setAuthAdmin({ admin: null, isLoading: false });
  };

  return (
    <AuthAdminContext.Provider value={{ authAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthAdminContext.Provider>
  );
};

export const useAuthAdmin = () => useContext(AuthAdminContext);
