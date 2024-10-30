import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api-client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"; // Google login
import "./LoginPage.css"; // Import CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Sử dụng login từ AuthContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/user/login", formData);
      console.log("Response data:", response.data);
      const { accessToken, id, user } = response.data;

      // Kiểm tra nếu user không tồn tại
      if (!user) {
        setError("Không nhận được thông tin người dùng từ máy chủ.");
        return;
      }

      localStorage.setItem("userId", id);
      login(user, accessToken);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const response = await apiClient.post("/user/google-login", {
        credential,
      });
      const { accessToken, id, user } = response.data;

      // Lưu thông tin người dùng và accessToken vào localStorage
      localStorage.setItem("userId", id);
      login(user, accessToken);

      navigate("/");
      // Không cần thiết phải reload trang
    } catch (error) {
      setError("Đăng nhập với Google thất bại!");
    }
  };

  const handleGoogleLoginFailure = (error) => {
    setError("Đăng nhập với Google thất bại!");
  };

  // Xóa useEffect để làm mới token, vì đã được xử lý trong AuthContext

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <section className="vh-100" style={{ backgroundColor: "#343a40" }}>
        <div className="container py-5 h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div
                className="card text-white"
                style={{ borderRadius: "1rem", backgroundColor: "#212529" }}
              >
                <div className="card-body p-5 text-center">
                  <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                  <p className="text-white-50 mb-5">
                    Vui lòng nhập email và mật khẩu của bạn!
                  </p>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-4">
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

                    <div className="form-floating mb-4">
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

                    <div className="mb-4">
                      <Link to="#" className="small text-muted">
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <button
                      className="btn btn-primary btn-lg btn-block"
                      type="submit"
                    >
                      Đăng nhập
                    </button>
                  </form>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-center">
                    <a href="#!" className="btn btn-primary me-2">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#!" className="btn btn-info me-2">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginFailure}
                      render={(renderProps) => (
                        <button
                          className="btn btn-danger"
                          onClick={renderProps.onClick}
                        >
                          <i className="fab fa-google"></i>
                        </button>
                      )}
                    />
                  </div>

                  <p className="mt-5 mb-0">
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/signup" className="text-white-50 fw-bold">
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
