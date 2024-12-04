// src/components/Footer/Footer.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-section bg-dark text-white">
      <div className="container py-5">
        <div className="row justify-content-between">
          {/* Company Info */}
          <div className="col-md-3 mb-4">
            <h5 className="text-uppercase mb-3 font-weight-bold">TechStore</h5>
            <p className="footer-description">
              Your one-stop shop for the latest and greatest in technology
              products.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h5 className="text-uppercase mb-3 font-weight-bold">
              Quick Links
            </h5>
            <ul className="footer-links list-unstyled">
              <li>
                <NavLink to="/" className="footer-link">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/product" className="footer-link">
                  Products
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="footer-link">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="footer-link">
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase mb-3 font-weight-bold">Contact</h5>
            <ul className="footer-contact list-unstyled">
              <li>
                <i className="fas fa-home mr-3"></i> 123 Tech Street, City,
                Country
              </li>
              <li>
                <i className="fas fa-envelope mr-3"></i> support@example.com
              </li>
              <li>
                <i className="fas fa-phone mr-3"></i> +123 456 789
              </li>
              <li>
                <i className="fas fa-print mr-3"></i> +123 456 789
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-3 mb-4">
            <h5 className="text-uppercase mb-3 font-weight-bold">Follow Us</h5>
            <div className="footer-social-links">
              <a href="#" className="social-link facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-divider mb-4" />

        {/* Footer Bottom */}
        <div className="row align-items-center">
          <div className="col-md-7">
            <p className="footer-copyright mb-0">
              © 2024 TechStore. All rights reserved.
            </p>
          </div>

          <div className="col-md-5 text-md-right">
            <p className="footer-design mb-0">Designed by Your Company</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
