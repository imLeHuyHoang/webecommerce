// ServicesSection.js
import React from "react";

function ServicesSection() {
  return (
    <section className="services-section py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5">Our Services</h2>
        <div className="row">
          <div className="col-md-4 text-center">
            <i className="fas fa-shipping-fast fa-3x mb-3"></i>
            <h4>Fast Shipping</h4>
            <p>Get your products delivered quickly to your doorstep.</p>
          </div>
          <div className="col-md-4 text-center">
            <i className="fas fa-headset fa-3x mb-3"></i>
            <h4>24/7 Support</h4>
            <p>We are here to help you anytime, anywhere.</p>
          </div>
          <div className="col-md-4 text-center">
            <i className="fas fa-sync-alt fa-3x mb-3"></i>
            <h4>Easy Returns</h4>
            <p>Not satisfied? Return your product easily.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
