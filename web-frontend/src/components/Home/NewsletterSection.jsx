// src/components/HomePage/NewsletterSection.jsx
import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./NewsletterSection.css"; // Import CSS truyền thống

function NewsletterSection() {
  return (
    <section className="newsletter-section py-5 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <h2 className="mb-4">Stay Updated</h2>
            <p className="mb-4">
              Subscribe to our newsletter to get the latest news and offers.
            </p>
            <Form className="d-flex justify-content-center">
              <Form.Group controlId="formBasicEmail" className="w-75">
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  className="mb-2"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="ml-2">
                Subscribe
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default NewsletterSection;
