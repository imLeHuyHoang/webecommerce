// src/components/HomePage/HomePage.jsx
import React from "react";
import HeroSection from "./HeroSection";
import CarouselSection from "./CarouselSection";
import FeatureProduct from "./FeatureProduct";
import imgBackground from "../../assets/techstore.jpg";
import ServicesAndTestimonials from "./ServicesAndTestimonials.jsx";
import "./HomePage.css";
const HomePage = () => {
  return (
    <div className="Home-page-container">
      {/* Hero Section */}
      <HeroSection
        title="Chào mừng đến với Tech Store của tôi"
        subtitle="Cung cấp các sản phẩm công nghệ hàng đầu với chất lượng và giá thành tốt nhất"
        link="/product"
        image={imgBackground}
      />

      {/* Featured Products */}
      <FeatureProduct />

      {/* Carousel Section */}
      <CarouselSection />

      {/* Services and Testimonials */}
      <ServicesAndTestimonials />
    </div>
  );
};

export default HomePage;
