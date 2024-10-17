import React from "react";
import "./HeroSection.css";
const HeroSection = ({ title, subtitle, link, image }) => {
  return (
    <section className="hero_section">
      <div className="hero_text">
        <h2 className="hero_title">{title}</h2>
        <p className="hero_sub"> {subtitle} </p>
        <a href={link} className="hero_link">
          See on Apple.com
        </a>
      </div>
      <div className="hero_image_container">
        <img src={image} alt={title} className="hero_image" />
      </div>
    </section>
  );
};

export default HeroSection;
