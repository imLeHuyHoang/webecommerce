// AboutUs.jsx
import React from "react";
import "./AboutUs.css";

function AboutUs() {
  return (
    <div className="about-us-container">
      <h2 className="section-title">ABOUT US</h2>
      <p className="about-us-text">
        "TechWorld is your one-stop shop for all things mobile. We offer a wide
        range of smartphones, tablets, and accessories from top brands. Our
        knowledgeable staff is dedicated to helping you find the perfect device
        to suit your needs."
      </p>
      <div className="our-mission">
        <h3>Our Mission</h3>
        <p>
          "Our mission is to provide our customers with the latest technology at
          affordable prices, while offering exceptional customer service."
        </p>
      </div>
      <div className="our-values">
        <button className="button_values" role="button">
          <span class="text">Innovation</span>
          <span>Revolution</span>
        </button>
        <button className="button_values" role="button">
          <span class="text">Quality</span>
          <span>Value</span>
        </button>
        <button className="button_values" role="button">
          <span class="text">Customer satisfaction</span>
          <span>Pleasing</span>
        </button>
      </div>
    </div>
  );
}

export default AboutUs;
