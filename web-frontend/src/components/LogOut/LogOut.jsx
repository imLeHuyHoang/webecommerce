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
      try {
        // Gọi API logout server-side nếu có (không bắt buộc).
        // await apiClient.post("/user/logout");

        // Đăng xuất user thường
        await logout();
        // Đăng xuất admin
        logoutAdmin();

        // Xóa hết token/key trong localStorage (quan trọng nhất)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");

        // Chuyển hướng về trang chủ (hoặc login user)
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    handleLogout();
  }, [logout, logoutAdmin, navigate]);

  return <p>Đang đăng xuất...</p>;
};

export default Logout;
