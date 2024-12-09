// src/components/LoginPage/VerifyCode.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/user/verify-code", { email, code });
      // Nếu verify thành công:
      navigate("/reset-password", { state: { email, code } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="bg-white p-5 rounded shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h5 className="text-center mb-4">Nhập mã xác thực</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleVerifyCode}>
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
          <div className="mb-3">
            <label className="form-label">Mã xác thực</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập mã xác thực"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
