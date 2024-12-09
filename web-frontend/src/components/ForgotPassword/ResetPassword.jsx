// src/components/LoginPage/ResetPassword.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, code } = location.state || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const response = await apiClient.post("/user/reset-password", {
        email,
        code,
        password,
      });
      alert("Đặt lại mật khẩu thành công. Hãy đăng nhập với mật khẩu mới.");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  if (!email || !code) {
    return <p>Truy cập không hợp lệ.</p>;
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="bg-white p-5 rounded shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h5 className="text-center mb-4">Đặt lại mật khẩu</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
