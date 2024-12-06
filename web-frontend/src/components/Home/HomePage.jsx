// src/components/HomePage/HomePage.jsx
import React from "react";
import HeroSection from "./HeroSection";
import CarouselSection from "./CarouselSection";
import FeatureProduct from "./FeatureProduct";
import ServicesSection from "./ServicesSection";
import TestimonialsSection from "./TestimonialsSection";
import NewsletterSection from "./NewsletterSection";
import imgBackground from "../../../public/techstore.jpg";
const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Chào mừng đến với Tech Store"
        subtitle="Cung cấp các sản phẩm công nghệ hàng đầu với chất lượng và giá thành tốt nhất"
        link="/product"
        image={imgBackground}
      />

      {/* Featured Products */}
      <FeatureProduct />

      {/* Carousel Section */}
      <CarouselSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
