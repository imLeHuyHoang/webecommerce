import React from "react";
import HeroSection from "./HeroSection";
import FeatureProduct from "./FeatureProduct";
import ServicesSection from "./ServicesSection";
import TestimonialsSection from "./TestimonialsSection";
import NewsletterSection from "./NewsletterSection";
import CarouselSection from "./CarouselSection";

const HomePage = () => {
  return (
    <div>
      <CarouselSection />
      <FeatureProduct />
      <ServicesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
