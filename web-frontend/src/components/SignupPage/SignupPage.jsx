import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignupPage.css";
import apiClient from "../../utils/api-client";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

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

      setMessage("Sign Up Successful!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      navigator.push("/home");
    } catch (error) {
      const errMessage = error.response?.data?.message || "Sign Up Failed!";
      setMessage(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-signup">
      <div className="container">
        <div className="card">
          <h2 className="text-center">Sign Up</h2>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <div className="text-center mt-3">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-primary">
                  Login here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
