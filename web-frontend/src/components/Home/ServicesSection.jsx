// src/components/HomePage/ServicesSection.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./ServicesSection.css"; // Import CSS truyền thống

function ServicesSection() {
  const services = [
    {
      icon: "fas fa-shipping-fast",
      title: "Giao Hàng Nhanh",
      description: "Sản phẩm được giao nhanh chóng đến tận nhà.",
    },
    {
      icon: "fas fa-headset",
      title: "Hỗ Trợ 24/7",
      description: "Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.",
    },
    {
      icon: "fas fa-sync-alt",
      title: "Đổi Trả Dễ Dàng",
      description: "Không hài lòng? Đổi trả sản phẩm dễ dàng.",
    },
    {
      icon: "fas fa-lock",
      title: "Thanh Toán An Toàn",
      description: "Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối.",
    },
    {
      icon: "fas fa-gift",
      title: "Ưu Đãi Đặc Biệt",
      description: "Nhận ngay các ưu đãi và giảm giá đặc biệt",
    },
    {
      icon: "fas fa-certificate",
      title: "Chất Lượng Đảm Bảo",
      description: "Sản phẩm luôn đạt chất lượng cao nhất.",
    },
  ];

  return (
    <section className="services-section py-5 bg-light">
      <Container>
        <h2 className="text-center text-services mb-5">
          Dịch Vụ Của Chúng Tôi
        </h2>
        <Row>
          {services.map((service, index) => (
            <Col key={index} md={4} className="text-center mb-4">
              <Card className="service-card">
                <Card.Body>
                  <i className={`${service.icon} fa-3x mb-3 service-icon`}></i>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default ServicesSection;
