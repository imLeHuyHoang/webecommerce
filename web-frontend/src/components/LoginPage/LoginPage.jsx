import React, { useState, useEffect } from "react";
import api from "../../Services/api"; // Sử dụng api.js
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");

    try {
      // Send login request to the backend
      const response = await api.post(
        "http://localhost:5000/api/user/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      // Store the JWT token
      localStorage.setItem("token", response.data.token);

      // Redirect or update UI accordingly
      alert("Login Successful!");
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
