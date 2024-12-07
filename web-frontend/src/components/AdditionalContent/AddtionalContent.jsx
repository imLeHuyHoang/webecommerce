// src/components/AdditionalContent/AdditionalContent.js

import React from "react";
import { Carousel, Alert, Button } from "react-bootstrap";
import "./AdditionalContent.css";

const AdditionalContent = () => {
  return (
    <div className="additional-content mt-4">
      {/* Promotional Carousel */}
      <Carousel className="mb-3">
        <Carousel.Item>
          <img
            className="d-block w-100 additional-carousel-image"
            src="https://via.placeholder.com/600x300?text=Promotion+1"
            alt="Promotion 1"
          />
          <Carousel.Caption>
            <h5>Khuyến mãi 1</h5>
            <p>Miêu tả khuyến mãi 1.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 additional-carousel-image"
            src="https://via.placeholder.com/600x300?text=Promotion+2"
            alt="Promotion 2"
          />
          <Carousel.Caption>
            <h5>Khuyến mãi 2</h5>
            <p>Miêu tả khuyến mãi 2.</p>
          </Carousel.Caption>
        </Carousel.Item>
        {/* Add more Carousel.Items as needed */}
      </Carousel>
    </div>
  );
};

export default AdditionalContent;
