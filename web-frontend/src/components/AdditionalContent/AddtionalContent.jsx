import React from "react";
import { Carousel } from "react-bootstrap";
import "./AdditionalContent.css";
import imgSale1 from "../../assets/giangsinhsale.1.jpg";
import imgSale2 from "../../assets/iphone-16-pro.webp";

const AdditionalContent = () => {
  return (
    <div className="additional-content mt-4">
      {/* Promotional Carousel */}
      <Carousel className="mb-3">
        <Carousel.Item>
          <img
            className="d-block w-100 additional-carousel-image"
            src={imgSale1}
            alt="Promotion 1"
          />
          <Carousel.Caption>
            <h5>Giảm giá 30% cho mùa giáng sinh</h5>
            <p>Nhập code: SALE30</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 additional-carousel-image"
            src={imgSale2}
            alt="Promotion 2"
          />
          <Carousel.Caption>
            <h5>Giảm giá 10% cho iphone 16</h5>
            <p>Nhập code: Iphone16</p>
          </Carousel.Caption>
        </Carousel.Item>
        {/* Add more Carousel.Items as needed */}
      </Carousel>
    </div>
  );
};

export default AdditionalContent;
