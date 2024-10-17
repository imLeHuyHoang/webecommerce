import React from "react";
import "./LinkWithIcon.css";

function LinkWithIcon({ href, iconClass, text }) {
  return (
    <a href={href} className="link-with-icon">
      <i className={iconClass}></i>
      {text}
    </a>
  );
}

export default LinkWithIcon;
