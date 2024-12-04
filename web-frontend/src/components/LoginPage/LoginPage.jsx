// src/components/LoginPage/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api-client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./LoginPage.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    try {
      const response = await apiClient.post("/user/login", formData);
      const { accessToken, id, user } = response.data;

      if (!user) {
        setError("Không nhận được thông tin người dùng từ máy chủ.");
        return;
      }

      localStorage.setItem("userId", id);
      login(user, accessToken);
      navigate("/");
      window.location.reload();
    } catch (error) {
      // **Enhanced Error Handling: Display specific error messages from the backend**
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Email hoặc mật khẩu không đúng!");
      }
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    setError(""); // Reset error message
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
      navigate("/");
    } catch (error) {
      // **Enhanced Error Handling for Google Login**
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Đăng nhập với Google thất bại!");
      }
    }
  };

  const handleGoogleLoginFailure = () => {
    setError("Đăng nhập với Google thất bại!");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="bg-light d-flex align-items-center justify-content-center min-vh-100">
        <div
          className="bg-white p-5 rounded shadow-lg w-100 google-login-container"
          style={{ maxWidth: "400px" }}
        >
          <h5 className="text-center text-login ">Đăng nhập</h5>

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
              <Link to="#" className="forget-pass">
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
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              render={(renderProps) => (
                <button
                  className="btn btn-danger w-100 mb-3 google-login-btn"
                  onClick={renderProps.onClick}
                >
                  <i className="fab fa-google me-2"></i> Đăng nhập với Google
                </button>
              )}
            />
          </div>

          <div className="d-flex justify-content-between two-button">
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
