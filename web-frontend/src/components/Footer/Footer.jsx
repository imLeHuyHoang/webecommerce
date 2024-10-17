import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer_container">
      <div className="footer_content">
        {/* Phần liên kết */}
        <div className="footer_links">
          <a href="/" className="footer_link">
            Home
          </a>
          <a href="/about" className="footer_link">
            About Us
          </a>
          <a href="/products" className="footer_link">
            Products
          </a>
          <a href="/contact" className="footer_link">
            Contact
          </a>
        </div>

        {/* Phần thông tin liên hệ */}
        <div className="footer_contact">
          <p>Contact us at: support@example.com</p>
          <p>Phone: +123 456 789</p>
        </div>

        {/* Icon mạng xã hội */}
        <div className="footer_socials">
          <a href="#" className="footer_social_icon">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="#" className="footer_social_icon">
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a href="#" className="footer_social_icon">
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
      <div className="footer_copyright">
        <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
