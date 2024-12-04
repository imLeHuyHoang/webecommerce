import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./HeroSection.css"; // Import CSS truyền thống

const HeroSection = ({ title, subtitle, link, image }) => {
  return (
    <div
      className="bg-image text-white"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="mask">
        <Container className="hero-container">
          <Col md={8} className="text-center">
            <h1 className="hero-title">{title}</h1>
            <h4 className="hero-subtitle">{subtitle}</h4>
            <Button variant="outline-light" size="lg" href={link}>
              Learn More
            </Button>
          </Col>
        </Container>
      </div>
    </div>
  );
};

export default HeroSection;
