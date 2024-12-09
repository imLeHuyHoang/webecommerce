// src/components/LoginPage/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // sử dụng hook để chuyển trang

  const handleSendCode = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await apiClient.post("/user/forgot-password", { email });
      // Nếu gửi mã thành công, ta chuyển hướng sang trang verify-code
      // và có thể truyền email qua state để tiện cho người dùng không cần nhập lại email.
      navigate("/verify-code", { state: { email } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="bg-white p-5 rounded shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h5 className="text-center mb-4">Quên mật khẩu</h5>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSendCode}>
          <div className="mb-3">
            <label className="form-label">Email của bạn</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Gửi mã xác thực
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
