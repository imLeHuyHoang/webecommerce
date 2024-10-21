import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useAuth } from "../../context/AuthContext";

const Logout = () => {
  const { logout } = useAuth(); // Sử dụng hàm logout từ AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        logout(); // Xóa thông tin người dùng trong AuthContext
        navigate("/login");
        console.log("Đăng xuất thành công!");
        localStorage.removeItem("cart"); // Xóa token
        window.location.reload();
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <p>Đang đăng xuất...</p>;
};

export default Logout;
