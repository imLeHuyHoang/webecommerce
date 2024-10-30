// TestimonialsSection.js
import React from "react";
import "./TestimonialsSection.css";

function TestimonialsSection() {
  return (
    <section className="testimonials-section py-5">
      <div className="container">
        <h2 className="text-center mb-5 text-white">What Our Customers Say</h2>
        <div className="row">
          <div className="col-md-4">
            <div className="card testimonial-card">
              <div className="card-body">
                <p className="card-text">
                  "Great products and amazing customer service!"
                </p>
                <h5 className="card-title">- John Doe</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card testimonial-card">
              <div className="card-body">
                <p className="card-text">
                  "Fast delivery and excellent quality."
                </p>
                <h5 className="card-title">- Jane Smith</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card testimonial-card">
              <div className="card-body">
                <p className="card-text">
                  "I love shopping here! Highly recommended."
                </p>
                <h5 className="card-title">- Bob Johnson</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
