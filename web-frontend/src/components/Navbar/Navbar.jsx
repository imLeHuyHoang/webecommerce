import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthAdmin } from "../../context/AuthAdminContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";
import LinkWithIcon from "./LinkWithIcon";

function Navbar() {
  const { auth, logout } = useAuth();
  const user = auth.user;

  const { authAdmin, logoutAdmin } = useAuthAdmin();
  const { admin, isLoading } = authAdmin;
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  if (isLoading) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mar">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          TechStore
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {!admin && (
              <>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Home"
                    link="/"
                    icon="fas fa-home"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Products"
                    link="/product"
                    icon="fas fa-box"
                    onClick={closeMenu}
                  />
                </li>
              </>
            )}

            {!user && !admin && (
              <>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Login"
                    link="/login"
                    icon="fas fa-sign-in-alt"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Sign Up"
                    link="/signup"
                    icon="fas fa-user-plus"
                    onClick={closeMenu}
                  />
                </li>
              </>
            )}

            {admin && (
              <>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Dashboard"
                    link="/admin"
                    icon="fas fa-tachometer-alt"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="User Management"
                    link="/admin/usermanagement"
                    icon="fas fa-users-cog"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Product Management"
                    link="/admin/productmanagement"
                    icon="fas fa-boxes"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Order Management"
                    link="/admin/ordermanagement"
                    icon="fas fa-shopping-cart"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => {
                      logoutAdmin();
                      closeMenu();
                      navigate("/admin-login", { replace: true });
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </li>
              </>
            )}

            {user && !admin && (
              <>
                <li className="nav-item">
                  <NavLink to="/cart" className="nav-link" onClick={closeMenu}>
                    <i className="fas fa-shopping-cart"></i> Cart ({cartCount})
                  </NavLink>
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="My Orders"
                    link="/my-order"
                    icon="fas fa-shopping-bag"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title={user.name}
                    link="/profile"
                    icon="fas fa-user"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => {
                      logout();
                      closeMenu();
                      navigate("/login", { replace: true });
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
