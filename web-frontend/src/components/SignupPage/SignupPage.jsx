import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import "./SignupPage.css"; // We'll adjust this if necessary

// Schema definition remains the same
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    // Validate data with Zod
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

    // Prepare full form data
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
      // Send data to API server
      await axios.post(
        "http://localhost:5000/api/user/register",
        fullFormData,
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("Sign Up Successful!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      const errMessage = error.response?.data?.message || "Sign Up Failed!";
      setMessage(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container signup-container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Sign Up</h2>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group mb-3">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-3 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-primary">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
