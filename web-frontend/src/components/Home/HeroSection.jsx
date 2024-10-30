// HeroSection.js
import React from "react";
import "./HeroSection.css";

const HeroSection = ({ title, subtitle, link, image }) => {
  return (
    <div
      className="bg-image text-white"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div
        className="mask"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", minHeight: "400px" }}
      >
        <div className="container h-100 d-flex align-items-center">
          <div className="text-center w-100">
            <h1 className="mb-3">{title}</h1>
            <h4 className="mb-4">{subtitle}</h4>
            <a href={link} className="btn btn-outline-light btn-lg">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
