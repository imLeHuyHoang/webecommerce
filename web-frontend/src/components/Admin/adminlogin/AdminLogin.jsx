import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthAdmin } from "../../../context/AuthAdminContext";
import apiClient from "../../../utils/api-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminLogin.css";

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
      const { accessToken, user } = response.data;
      loginAdmin(user);
      localStorage.setItem("adminAccessToken", accessToken);
      console.log("Admin logged in:", user);
      navigate("/admin");
    } catch (error) {
      console.error("Admin login failed:", error);
      setError("Đăng nhập không thành công.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-4">Đăng Nhập Admin</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Admin
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Admin"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Đăng Nhập
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login">Quay về trang đăng nhập cho người dùng</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
