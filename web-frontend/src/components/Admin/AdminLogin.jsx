import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthAdmin } from "../../context/AuthAdminContext";
import apiClient from "../../utils/api-client";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAuthAdmin();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/user/loginadmin", formData);
      const { accessToken, admin } = response.data;

      // Lưu admin vào localStorage và cập nhật AuthAdminContext
      loginAdmin(admin);
      localStorage.setItem("adminAccessToken", accessToken);

      console.log("Admin logged in:", admin);
      navigate("/admin"); // Điều hướng đến trang admin
      // Không cần thiết phải reload trang
    } catch (error) {
      console.error("Admin login failed:", error);
      setError("Đăng nhập không thành công.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login as Admin</button>
      </form>
    </div>
  );
};

export default AdminLogin;
