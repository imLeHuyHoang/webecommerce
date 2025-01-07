// src/components/SignupPage/SignUp.jsx
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignupPage.css";
import apiClient from "../../utils/api-client";

const signupSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isSuccess) {
      // Nếu đăng ký thành công, sau 3 giây chuyển trang
      timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    // Xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu không khớp" });
      setLoading(false);
      return;
    }

    // Xác thực dữ liệu form sử dụng Zod
    const validationResult = signupSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const fullFormData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: "",
      gender: "other",
      roles: ["user"],
      isActive: true,
      addresses: [
        {
          province: "",
          district: "",
          ward: "",
          street: "",
          default: false,
        },
      ],
      lastLogin: new Date(),
    };

    try {
      await apiClient.post("/user/register", fullFormData);

      setMessage("Đăng ký thành công!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setLoading(false);
      setIsSuccess(true);
    } catch (error) {
      const errMessage = error.response?.data?.message || "Đăng ký thất bại!";
      setMessage(errMessage);
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // Điều hướng ngay lập tức khi bấm nút
    navigate("/login");
  };

  return (
    <section className="sign-up-page-container">
      <div className="container sign-up-page-container-inner">
        <div className="card sign-up-page-card">
          {!isSuccess ? (
            <>
              <h2 className="text-center sign-up-page-title">Đăng ký</h2>
              {message && (
                <div className="alert sign-up-page-alert">{message}</div>
              )}
              <form onSubmit={handleSubmit} className="sign-up-page-form">
                <div className="mb-3 sign-up-page-form-group">
                  <label
                    htmlFor="name"
                    className="form-label sign-up-page-label"
                  >
                    Tên
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control sign-up-page-input ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="Nhập tên của bạn"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                  {errors.name && (
                    <div className="invalid-feedback sign-up-page-error">
                      {errors.name}
                    </div>
                  )}
                </div>
                <div className="mb-3 sign-up-page-form-group">
                  <label
                    htmlFor="email"
                    className="form-label sign-up-page-label"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control sign-up-page-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback sign-up-page-error">
                      {errors.email}
                    </div>
                  )}
                </div>
                <div className="mb-3 sign-up-page-form-group">
                  <label
                    htmlFor="password"
                    className="form-label sign-up-page-label"
                  >
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control sign-up-page-input ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback sign-up-page-error">
                      {errors.password}
                    </div>
                  )}
                </div>
                <div className="mb-3 sign-up-page-form-group">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label sign-up-page-label"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control sign-up-page-input ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Xác nhận mật khẩu của bạn"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback sign-up-page-error">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
                <div className="d-grid sign-up-page-submit-group">
                  <button
                    type="submit"
                    className="btn btn-primary sign-up-page-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </div>
                <div className="text-center mt-3 sign-up-page-footer">
                  <p>
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="sign-up-page-login-link">
                      Đăng nhập tại đây
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center p-4">
              <h2>Đăng ký thành công!</h2>
              <p>Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.</p>
              <button
                className="btn btn-success mt-3"
                onClick={handleGoToLogin}
              >
                Chuyển đến trang đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SignUp;
