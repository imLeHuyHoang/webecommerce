import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api-client";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ AuthContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/user/login", formData);
      const { accessToken, id } = response.data;

      // Lưu accessToken và userId vào localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", id);

      login(accessToken); // Cập nhật AuthContext
      navigate("/");
      window.location.reload();
      console.log("User logged in:", response.data);
    } catch (error) {
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  // Tự động refresh access token khi hết hạn
  const refreshToken = async () => {
    try {
      const response = await apiClient.get("/user/refreshToken", {
        withCredentials: true, // Đảm bảo gửi cookie refreshToken
      });

      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      login(accessToken);
    } catch (error) {
      console.error("Lỗi làm mới token:", error);
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  // Refresh token sau mỗi 10 phút (600000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 600000); // 10 phút

    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
