import React, { useState, useEffect, useContext } from "react";
import api from "../../Services/api";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Services/authContext"; // Import đúng context

const LoginPage = () => {
  const { auth, setAuth } = useContext(AuthContext); // Đảm bảo setAuth tồn tại
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      verifyUser();
    }
  }, []);

  const verifyUser = async () => {
    try {
      const response = await api.get("/api/user/me");
      setAuth({
        isAuthenticated: true,
        user: response.data,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("User verification failed:", error);
      localStorage.removeItem("accessToken");
      setAuth({ isAuthenticated: false, user: null });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");

    try {
      const response = await api.post("/api/user/login", formData);
      localStorage.setItem("accessToken", response.data.accessToken);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.accessToken}`;

      setAuth({
        isAuthenticated: true,
        user: response.data.user,
      });

      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login Failed!";
      setErrors(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errors && <p className="error">{errors}</p>}
      <form onSubmit={handleSubmit}>
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
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
