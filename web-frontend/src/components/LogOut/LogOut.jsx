// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthAdmin } from "../../context/AuthAdminContext";
import apiClient from "../../utils/api-client"; // Import apiClient để sử dụng

const Logout = () => {
  const { logout } = useAuth();
  const { logoutAdmin } = useAuthAdmin();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(); // Gọi hàm logout từ AuthContext
      logoutAdmin(); // Gọi hàm logoutAdmin nếu cần
    };

    handleLogout();
  }, [logout, logoutAdmin]);

  //xóa token khỏi localstorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  return <p>Đang đăng xuất...</p>;
};

export default Logout;
