import React, { useState } from "react";
import axios from "axios"; // Thêm axios để gọi API
import { z } from "zod";
import "./SignupPage.css"; // CSS tùy chỉnh

// Schema Zod để xác thực form
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine(
      (val, ctx) => val === ctx.parent.password,
      "Passwords do not match"
    ),
});

function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Quản lý trạng thái loading

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Xác thực form bằng Zod
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Gửi yêu cầu đăng ký đến backend
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage("Sign Up Successful!");
      console.log("User signed up:", response.data);
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
    <section className="vh-100 gradient-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div
              className="card bg-dark text-white"
              style={{ borderRadius: "1rem" }}
            >
              <div className="card-body p-5 text-center">
                <div className="mb-md-5 mt-md-4 pb-5">
                  <h2 className="fw-bold mb-2 text-uppercase">Sign Up</h2>
                  <p className="text-white-50 mb-5">
                    Please enter your information to sign up!
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-outline form-white mb-4">
                      <input
                        type="text"
                        id="typeName"
                        name="name"
                        className="form-control form-control-lg"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="typeName">
                        Name
                      </label>
                      {errors.name && (
                        <span className="text-danger">{errors.name}</span>
                      )}
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="email"
                        id="typeEmail"
                        name="email"
                        className="form-control form-control-lg"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="typeEmail">
                        Email
                      </label>
                      {errors.email && (
                        <span className="text-danger">{errors.email}</span>
                      )}
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="password"
                        id="typePassword"
                        name="password"
                        className="form-control form-control-lg"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="typePassword">
                        Password
                      </label>
                      {errors.password && (
                        <span className="text-danger">{errors.password}</span>
                      )}
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="password"
                        id="typeConfirmPassword"
                        name="confirmPassword"
                        className="form-control form-control-lg"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <label
                        className="form-label"
                        htmlFor="typeConfirmPassword"
                      >
                        Confirm Password
                      </label>
                      {errors.confirmPassword && (
                        <span className="text-danger">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>

                    <button
                      className="btn btn-outline-light btn-lg px-5"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </form>

                  {message && <p className="mt-3 text-warning">{message}</p>}

                  <div className="d-flex justify-content-center text-center mt-4 pt-1">
                    <a href="#!" className="text-white">
                      <i className="fab fa-facebook-f fa-lg"></i>
                    </a>
                    <a href="#!" className="text-white">
                      <i className="fab fa-twitter fa-lg mx-4 px-2"></i>
                    </a>
                    <a href="#!" className="text-white">
                      <i className="fab fa-google fa-lg"></i>
                    </a>
                  </div>
                </div>

                <div>
                  <p className="mb-0">
                    Already have an account?{" "}
                    <a href="#!" className="text-white-50 fw-bold">
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignUpPage;
