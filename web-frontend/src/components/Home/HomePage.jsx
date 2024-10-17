import React from "react";
import HeroSection from "../Home/HeroSection";
import FeatureProduct from "./FeatureProduct";

const HomePage = () => {
  const Iphones = [
    {
      title: "Iphone 16 Pro",
      subtitle: "Hello, Apple Intelligence",
      link: "https://www.apple.com/in/iphone-16-pro/",
      image: "../../src/assets/iphone-16-pro.webp",
    },
    {
      title: "Iphone 16",
      subtitle: "Hello, Apple Intelligence",
      link: "https://www.apple.com/in/iphone-16/",
      image: "../../src/assets/iphone-16.jpg",
    },
  ];

  return (
    <div>
      <HeroSection
        title={Iphones[0].title}
        subtitle={Iphones[0].subtitle}
        link={Iphones[0].link}
        image={Iphones[0].image}
      />
      <FeatureProduct />
      <HeroSection
        title={Iphones[1].title}
        subtitle={Iphones[1].subtitle}
        link={Iphones[1].link}
        image={Iphones[1].image}
      ></HeroSection>
    </div>
  );
};

export default HomePage;
