import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api-client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./LoginPage.css";

import { useCart } from "../../context/CartContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const { updateCart } = useCart();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await apiClient.post("/user/login", formData);
      const { accessToken, user } = response.data;
      if (!user) {
        setError("Không nhận được thông tin người dùng từ máy chủ.");
        return;
      }

      // Gọi hàm login từ AuthContext
      login(user, accessToken);

      await updateCart();

      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      setError(errorMessage);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    setError("");
    try {
      const response = await apiClient.post("/user/google-login", {
        credential,
      });
      const { accessToken, user } = response.data;
      if (!user) {
        setError("Không nhận được thông tin người dùng từ máy chủ.");
        return;
      }

      login(user, accessToken);

      await updateCart();

      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đăng nhập với Google thất bại!";
      setError(errorMessage);
    }
  };

  const handleGoogleLoginFailure = () => {
    setError("Đăng nhập với Google thất bại!");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="login-page-bg-light d-flex align-items-center justify-content-center min-vh-100">
        <div
          className="login-page-bg-white p-5 rounded shadow-lg w-100 login-page-google-login-container"
          style={{ maxWidth: "400px" }}
        >
          <h5 className="text-center login-page-text-login">Đăng nhập</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Nhập email của bạn"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Nhập mật khẩu của bạn"
                onChange={handleChange}
                required
              />
            </div>
            <div className="d-flex justify-content-between mb-3">
              <Link to="/forgot-password" className="login-page-forget-pass">
                Quên mật khẩu?
              </Link>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Đăng nhập
            </button>
          </form>
          <div className="text-center my-3">
            <span className="text-muted">hoặc</span>
          </div>
          <div className="login-page-google-login">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
            />
          </div>
          <div className="d-flex justify-content-between login-page-two-button">
            <Link to="/signup" className="text-decoration-none">
              Bạn chưa có tài khoản? Đăng ký
            </Link>
            <Link to="/admin-login" className="text-decoration-none">
              Đăng nhập với tư cách admin?
            </Link>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
