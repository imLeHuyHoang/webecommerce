import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import LinkWithIcon from "./LinkWithIcon";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const { auth, logout } = useAuth();
  const { user } = auth;
  const { cartCount, fetchCartCount } = useCart(); // Nhận cartCount từ context
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar_header">
        <h1 className="navbar_heading">TECH STORE</h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      <div className={`navbar_links ${isOpen ? "open" : ""}`}>
        <LinkWithIcon title="Home" link="/" icon="fas fa-home" />
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fas fa-shopping-cart"></i> Cart ({cartCount})
        </NavLink>
        <LinkWithIcon title="Products" link="/product" icon="fas fa-box" />

        {!user ? (
          <>
            <LinkWithIcon
              title="Login"
              link="/login"
              icon="fas fa-sign-in-alt"
            />
            <LinkWithIcon
              title="SignUp"
              link="/signup"
              icon="fas fa-user-plus"
            />
          </>
        ) : (
          <>
            <LinkWithIcon
              title="My Orders"
              link="/order"
              icon="fas fa-shopping-bag"
            />
            <LinkWithIcon
              title="Logout"
              link="/logout"
              icon="fas fa-sign-out-alt"
            />
            <LinkWithIcon title="Profile" link="/profile" icon="fas fa-user" />
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
