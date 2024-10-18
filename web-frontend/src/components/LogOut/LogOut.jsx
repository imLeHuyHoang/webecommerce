import React, { useEffect } from "react";
import { useAuth } from "../../Services/authContext"; // Lấy thông tin từ AuthContext
import { useNavigate } from "react-router-dom"; // Điều hướng giữa các trang
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // CSS cho react-toastify

function Logout() {
  const { auth, logout } = useAuth(); // Lấy trạng thái đăng nhập và hàm logout
  const { isAuthenticated } = auth;
  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    if (isAuthenticated) {
      logout(); // Thực hiện logout nếu người dùng đã đăng nhập
      toast.success("Đăng xuất thành công!"); // Thông báo thành công
      // thêm reload trang để cập nhật trạng thái đăng nhập
      window.location.reload();

      navigate("/"); // Điều hướng về trang đăng nhập
    } else {
      toast.warn("Bạn chưa đăng nhập, không thể logout!"); // Thông báo nếu chưa đăng nhập
      navigate("/"); // Điều hướng về trang chủ
    }
  }, [isAuthenticated, logout, navigate]);

  return (
    <div className="logout-container">
      <h2>Đang xử lý đăng xuất...</h2>
      <ToastContainer /> {/* Thêm ToastContainer vào JSX */}
    </div>
  );
}

export default Logout;
