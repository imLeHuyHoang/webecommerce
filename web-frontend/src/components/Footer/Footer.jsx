// Footer.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <div className="container text-md-left">
        <div className="row text-md-left">
          {/* Company Info */}
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold">TechStore</h5>
            <p>
              Your one-stop shop for the latest and greatest in technology
              products.
            </p>
          </div>

          {/* Links */}
          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold">
              Quick Links
            </h5>
            <p>
              <NavLink
                to="/"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                Home
              </NavLink>
            </p>
            <p>
              <NavLink
                to="/product"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                Products
              </NavLink>
            </p>
            <p>
              <NavLink
                to="/about"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                About Us
              </NavLink>
            </p>
            <p>
              <NavLink
                to="/contact"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                Contact
              </NavLink>
            </p>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold">Contact</h5>
            <p>
              <i className="fas fa-home mr-3"></i> 123 Tech Street, City,
              Country
            </p>
            <p>
              <i className="fas fa-envelope mr-3"></i> support@example.com
            </p>
            <p>
              <i className="fas fa-phone mr-3"></i> +123 456 789
            </p>
            <p>
              <i className="fas fa-print mr-3"></i> +123 456 789
            </p>
          </div>

          {/* Social Media */}
          <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mt-3 ">
            <h5 className="text-uppercase mb-4 font-weight-bold">Follow Us</h5>
            <a
              href="#"
              className="btn btn-primary btn-floating m-1"
              style={{ backgroundColor: "#3b5998" }}
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              className="btn btn-primary btn-floating m-1"
              style={{ backgroundColor: "#55acee" }}
            >
              <i className="fab fa-twitter"></i>
            </a>

            <a
              href="#"
              className="btn btn-primary btn-floating m-1"
              style={{ backgroundColor: "#ac2bac" }}
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <hr className="mb-4" />

        {/* Footer Bottom */}
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p>© 2024 TechStore. All rights reserved.</p>
          </div>

          <div className="col-md-5 col-lg-4">
            <p className="text-md-right">Designed by Your Company</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
