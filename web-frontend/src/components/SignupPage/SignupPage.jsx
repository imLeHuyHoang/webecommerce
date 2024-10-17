import React, { useState } from "react";
import axios from "axios"; // Thư viện để gọi API
import { z } from "zod"; // Thư viện để xác thực dữ liệu
import "./SignupPage.css"; // CSS tùy chỉnh

// Định nghĩa schema với Zod để xác thực dữ liệu
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [message, setMessage] = useState(""); // Thông báo trạng thái

  // Xử lý khi có thay đổi trong các input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Kích hoạt trạng thái loading

    // Xác thực dữ liệu bằng Zod
    const validationResult = signupSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setLoading(false); // Tắt trạng thái loading
      return;
    }

    // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp nhau không
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false); // Tắt trạng thái loading
      return;
    }

    // Đóng gói dữ liệu với các trường cần thiết
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
      // Gửi dữ liệu đến API server
      const response = await axios.post(
        "http://localhost:5000/api/user/signup",
        fullFormData,
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Sign Up Successful!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" }); // Reset form
      setErrors({});
    } catch (error) {
      const errMessage = error.response?.data?.message || "Sign Up Failed!";
      setMessage(errMessage);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SignUp;
