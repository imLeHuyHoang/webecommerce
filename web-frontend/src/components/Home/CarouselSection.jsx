import React from "react";
import { Carousel } from "react-bootstrap";
import iphone16 from "../../assets/iphone16-1.jpg";
import iphone16Pro from "../../assets/iphone16-2.png";
import iphone16ProMax from "../../assets/iphone16-3.png";
import "./CarouselSection.css"; // Import CSS

function CarouselSection() {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={iphone16}
          alt="First slide"
        />
        <Carousel.Caption>
          <h3>iPhone 16</h3>
          <p>Experience the future of smartphones with iPhone 16.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={iphone16Pro}
          alt="Second slide"
        />
        <Carousel.Caption>
          <h3>iPhone 16 Pro</h3>
          <p>Unleash the power of the new iPhone 16 Pro.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={iphone16ProMax}
          alt="Third slide"
        />
        <Carousel.Caption>
          <h3>iPhone 16 Pro Max</h3>
          <p>The ultimate iPhone experience with iPhone 16 Pro Max.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselSection;
