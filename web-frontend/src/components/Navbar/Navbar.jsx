// src/components/Navbar/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthAdmin } from "../../context/AuthAdminContext";
import { useCart } from "../../context/CartContext"; // <-- CHỈNH SỬA
import "./Navbar.css";
import LinkWithIcon from "./LinkWithIcon";

function Navbar() {
  const { auth, logout } = useAuth();
  const user = auth.user;

  const { authAdmin, logoutAdmin } = useAuthAdmin();
  const { admin, isLoading } = authAdmin;

  // **CHỈNH SỬA**: Lấy cartCount, resetCartCount (hoặc updateCart)
  const { cartCount, resetCartCount } = useCart();

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
        <NavLink
          to={admin ? "/admin/productmanagement" : "/"}
          className="navbar-brand"
          onClick={closeMenu}
        >
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
                    title="Trang Chủ"
                    link="/"
                    icon="fas fa-home"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Sản Phẩm"
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
                    title="Đăng Nhập"
                    link="/login"
                    icon="fas fa-sign-in-alt"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Đăng Ký"
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
                    title="Bảng Điều Khiển"
                    link="/admin/dashboard"
                    icon="fas fa-tachometer-alt"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Quản Lý Người Dùng"
                    link="/admin/usermanagement"
                    icon="fas fa-users-cog"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Quản Lý Sản Phẩm"
                    link="/admin/productmanagement"
                    icon="fas fa-boxes"
                    onClick={closeMenu}
                  />
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Quản Lý Đơn Hàng"
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
                      // **CHỈNH SỬA**: Sau khi admin logout => resetCartCount (nếu muốn)
                      resetCartCount();
                      closeMenu();
                      navigate("/admin-login", { replace: true });
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Đăng Xuất
                  </button>
                </li>
              </>
            )}

            {user && !admin && (
              <>
                <li className="nav-item">
                  <NavLink to="/cart" className="nav-link" onClick={closeMenu}>
                    <i className="fas fa-shopping-cart"></i> Giỏ Hàng (
                    {cartCount})
                  </NavLink>
                </li>
                <li className="nav-item">
                  <LinkWithIcon
                    title="Đơn Hàng Của Tôi"
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
                      // **CHỈNH SỬA**: Sau khi user logout => resetCartCount
                      resetCartCount();
                      closeMenu();
                      navigate("/login", { replace: true });
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Đăng Xuất
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
