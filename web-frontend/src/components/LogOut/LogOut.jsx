// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthAdmin } from "../../context/AuthAdminContext";
import apiClient from "../../utils/api-client";

const Logout = () => {
  const { logout } = useAuth();
  const { logoutAdmin } = useAuthAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      // Gọi API logout server-side nếu cần (nếu có route /logout)
      // await apiClient.post("/logout");

      // Gọi hàm logout từ AuthContext (người dùng thường)
      await logout();
      // Gọi hàm logout từ AuthAdminContext (quản trị)
      logoutAdmin();

      // Xóa token user và admin khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("adminAccessToken");

      // Điều hướng về trang login thường hoặc trang chủ
      navigate("/");
    };

    handleLogout();
  }, [logout, logoutAdmin, navigate]);

  return <p>Đang đăng xuất...</p>;
};

export default Logout;
