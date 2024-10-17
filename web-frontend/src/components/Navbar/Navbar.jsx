import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [cartCount, setCartCount] = useState(0); // Số lượng giỏ hàng mặc định là 0

  return (
    <nav className="align_center navbar">
      <div className="align_center search_name">
        <h1 className="navbar_heading">TECH STORE</h1>
        <form className="navbar_form align_center">
          <input
            type="text"
            className="navbar_search"
            placeholder="Search Products"
          />
          <button type="submit" className="search_button">
            Search
          </button>
        </form>
      </div>
      <div className="navbar_links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-house"></i>
          Home
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-box-open"></i>
          Products
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-sign-in-alt"></i>
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-user-plus"></i>
          Signup
        </NavLink>
        <NavLink
          to="/my-order"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-shopping-bag"></i>
          My Order
        </NavLink>
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-sign-out-alt"></i>
          Logout
        </NavLink>
        {/* Icon giỏ hàng tùy chỉnh với số lượng */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? "link-with-icon active" : "link-with-icon"
          }
        >
          <i className="fa-solid fa-shopping-cart"></i>
          Cart ({cartCount})
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
