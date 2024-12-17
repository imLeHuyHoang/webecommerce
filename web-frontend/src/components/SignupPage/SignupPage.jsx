// src/components/SignupPage/SignUp.jsx
import React, { useState } from "react";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignupPage.css";
import apiClient from "../../utils/api-client";

// Define the signup schema using Zod
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Reset previous errors and messages
    setErrors({});
    setMessage("");

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    // Validate form data using Zod
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

    // Prepare full form data with additional fields (if necessary)
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

      setMessage("Sign Up Successful!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setLoading(false);
      navigate("/home"); // Navigate to home after successful signup
    } catch (error) {
      const errMessage = error.response?.data?.message || "Sign Up Failed!";
      setMessage(errMessage);
      setLoading(false);
    }
  };

  return (
    <section className="sign-up-page-container">
      <div className="container sign-up-page-container-inner">
        <div className="card sign-up-page-card">
          <h2 className="text-center sign-up-page-title">Sign Up</h2>
          {message && <div className="alert sign-up-page-alert">{message}</div>}
          <form onSubmit={handleSubmit} className="sign-up-page-form">
            <div className="mb-3 sign-up-page-form-group">
              <label htmlFor="name" className="form-label sign-up-page-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control sign-up-page-input ${
                  errors.name ? "is-invalid" : ""
                }`}
                placeholder="Enter your name"
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
              <label htmlFor="email" className="form-label sign-up-page-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control sign-up-page-input ${
                  errors.email ? "is-invalid" : ""
                }`}
                placeholder="Enter your email"
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
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control sign-up-page-input ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Enter your password"
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
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control sign-up-page-input ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="Confirm your password"
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
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <div className="text-center mt-3 sign-up-page-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="sign-up-page-login-link">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
