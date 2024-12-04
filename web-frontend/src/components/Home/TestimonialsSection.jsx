// src/components/HomePage/TestimonialsSection.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./TestimonialsSection.css"; // Import CSS truyền thống

function TestimonialsSection() {
  const testimonials = [
    {
      text: "Sản phẩm chất lượng và giá thành tốt.",
      author: "John Doe",
    },
    {
      text: "Dịch vụ giao hàng nhanh chóng và chuyên nghiệp.",
      author: "Jane Smith",
    },
    {
      text: "Rất hài lòng với chất lượng sản phẩm",
      author: "Bob Johnson",
    },
  ];

  return (
    <section className="testimonials-section py-5">
      <Container>
        <h2 className="text-center mb-3 ">What Our Customers Say</h2>
        <Row>
          {testimonials.map((testimonial, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card className="testimonial-card">
                <Card.Body>
                  <p className="card-text">"{testimonial.text}"</p>
                  <h5 className="card-title">- {testimonial.author}</h5>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default TestimonialsSection;
