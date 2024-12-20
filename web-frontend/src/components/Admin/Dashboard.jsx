// src/components/Dashboard.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import TotalProductsChart from "../Charts/TotalProductsChart";
import ProductsByCategoryChart from "../Charts/ProductsByCategoryChart";
import OrderStatusChart from "../Charts/OrderStatusChart";
import MonthlyStatisticsChart from "../Charts/MonthlyStatisticsChart";
import ReviewStatisticsChart from "../Charts/ReviewStatisticsChart";
import CustomerStatisticsChart from "../Charts/CustomerStatisticsChart";
import TopSellingProductsChart from "../Charts/TopSellingProductsChart";
import "../../utils/chartSetup";

const Dashboard = () => {
  return (
    <Container fluid style={{ padding: "20px", background: "#f0f2f5" }}>
      <h1 className="mb-4">Admin Dashboard</h1>
      <Row className="gy-4">
        <Col md={4}>
          <TotalProductsChart />
          <ReviewStatisticsChart />
          <TopSellingProductsChart style={{ height: "100%" }} />
          <CustomerStatisticsChart />
        </Col>
        <Col md={4}>
          <ProductsByCategoryChart className="mb-4 flex-grow-1" />
          <MonthlyStatisticsChart />
        </Col>
        <Col md={4} className="d-flex flex-column">
          <OrderStatusChart className="flex-grow-1" />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
