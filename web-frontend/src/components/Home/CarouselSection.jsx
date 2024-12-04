// src/components/HomePage/CarouselSection.jsx
import React from "react";
import { Carousel } from "react-bootstrap";
import iphone16 from "../../assets/iphone16-6.webp";
import iphone16_1 from "../../assets/iphone16-2.png";
import macbook from "../../assets/macbook-1.jpg";
import ios17 from "../../assets/iOS-17.webp";
import "./CarouselSection.css"; // Import CSS truyền thống

function CarouselSection() {
  return (
    <Carousel className="carousel-section">
      <Carousel.Item className="carousel-items">
        <img
          className="d-block w-100 carousel-image"
          src={ios17}
          alt="iOS 17"
        />
        <Carousel.Caption>
          <h3>iOS 17</h3>
          <p>
            Khám phá hàng loạt tính năng mới với iOS 17, nâng tầm trải nghiệm
            của bạn.
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={iphone16}
          alt="iPhone 16"
        />
        <Carousel.Caption>
          <h3>iPhone 16</h3>
          <p>
            Sở hữu công nghệ đột phá với iPhone 16, biến ước mơ của bạn thành
            hiện thực.
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={macbook}
          alt="MacBook"
        />
        <Carousel.Caption>
          <h3>MacBook</h3>
          <p>
            Hiệu suất vượt trội, thiết kế sang trọng - MacBook là người bạn đồng
            hành lý tưởng.
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={iphone16_1}
          alt="iPhone 16"
        />
        <Carousel.Caption>
          <h3>iPhone 16</h3>
          <p>
            Thể hiện phong cách cùng iPhone 16 với công nghệ vượt trội và nhiều
            đổi mới đột phá.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselSection;
