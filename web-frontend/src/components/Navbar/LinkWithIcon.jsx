import React from "react";
import "./LinkWithIcon.css";
import { NavLink } from "react-router-dom";

function LinkWithIcon({ title, link, icon }) {
  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        isActive ? "link-with-icon active" : "link-with-icon"
      }
    >
      <i className={icon}></i>
      {title}
    </NavLink>
  );
}

export default LinkWithIcon;
