import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import LinkWithIcon from "./LinkWithIcon";
import { useAuth } from "../../Services/authContext"; // Import useAuth hook

function Navbar() {
  const { auth, logout } = useAuth(); // Access auth state and logout function
  const { user } = auth;
  const [cartCount, setCartCount] = useState(0);

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
      <div className="navbar_links align_center">
        <LinkWithIcon title="Home" link="/" icon="fas fa-home" />
        <LinkWithIcon title="Products" link="/products" icon="fas fa-box" />
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
              link="/orders"
              icon="fas fa-shopping-bag"
            />
            <LinkWithIcon
              title="Logout"
              link="/logout"
              icon="fas fa-sign-out-alt"
              onClick={logout}
            />
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? "link-with-icon active" : "link-with-icon"
              }
            >
              <i className="fas fa-shopping-cart"></i>
              Cart ({cartCount})
            </NavLink>
          </>
        )}
        <LinkWithIcon title="Profile" link="/profile" icon="fas fa-user" />
      </div>
    </nav>
  );
}

export default Navbar;
