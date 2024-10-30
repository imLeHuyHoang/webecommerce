import React from "react";
import { NavLink } from "react-router-dom";
import "./LinkWithIcon.css";

function LinkWithIcon({ title, link, icon, onClick }) {
  return (
    <NavLink
      to={link}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
      onClick={onClick}
    >
      <i className={icon}></i> {title}
    </NavLink>
  );
}

export default LinkWithIcon;
