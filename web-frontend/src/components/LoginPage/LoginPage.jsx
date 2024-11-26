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
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const response = await apiClient.post("/user/google-login", {
        credential,
      });
      const { accessToken, user } = response.data;

      // Store user and accessToken
      login(user, accessToken);
      navigate("/");
    } catch (error) {
      setError("Đăng nhập với Google thất bại!");
    }
  };

  const handleGoogleLoginFailure = () => {
    setError("Đăng nhập với Google thất bại!");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <section
        className="vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#343a40" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div
                className="card shadow-lg border-0"
                style={{ borderRadius: "1rem", backgroundColor: "#212529" }}
              >
                <div className="card-body p-4 text-center text-white">
                  <h2 className="fw-bold mb-4">Đăng Nhập</h2>
                  <p className="text-white-50 mb-4">
                    Vui lòng nhập email và mật khẩu của bạn!
                  </p>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handleSubmit} className="mb-3">
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="form-control"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">Email</label>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="form-control"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="password">Mật khẩu</label>
                    </div>

                    <button className="btn btn-primary w-100 " type="submit">
                      Đăng nhập
                    </button>
                  </form>

                  <Link to="#" className="small text-forget d-block mb-3">
                    Quên mật khẩu?
                  </Link>

                  <div className="icon d-flex justify-content-center gap-2">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginFailure}
                      render={(renderProps) => (
                        <button
                          className="btn btn-info"
                          onClick={renderProps.onClick}
                        >
                          <i className="fab fa-google"></i>
                        </button>
                      )}
                    />
                  </div>

                  <p className="mt-4">
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/signup" className="text-white-50 signup">
                      Đăng ký
                    </Link>
                  </p>
                  <p>
                    <Link to="/admin-login" className="text-white-50">
                      Đăng nhập với tư cách admin?
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Login;
