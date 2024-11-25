// HeroSection.js
import React from "react";
import { Carousel } from "react-bootstrap";

function HeroSection() {
  return (
    <Carousel className="mb-4">
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/images/banner1.jpg"
          alt="First slide"
        />
        <Carousel.Caption>
          <h3>New Arrivals</h3>
          <p>Check out the latest products in our collection.</p>
        </Carousel.Caption>
      </Carousel.Item>
      {/* Add more Carousel.Items as needed */}
    </Carousel>
  );
}

export default HeroSection;
