import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar bg-light">
      <nav className="nav flex-column p-3">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/orders" className="nav-link">
          Order Management
        </Link>
        <Link to="/users" className="nav-link">
          User Management
        </Link>
        <Link to="/products" className="nav-link">
          Product Management
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
