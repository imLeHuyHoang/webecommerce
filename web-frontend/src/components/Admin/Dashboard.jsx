// src/components/Dashboard.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";

// Import toàn bộ các biểu đồ bạn có
import TotalProductsChart from "../Charts/TotalProductsChart";
import OrderStatusChart from "../Charts/OrderStatusChart";
import ReviewStatisticsChart from "../Charts/ReviewStatisticsChart";
import TopSellingProductsChart from "../Charts/TopSellingProductsChart";
import CustomerStatisticsChart from "../Charts/CustomerStatisticsChart";
import MonthlyStatisticsChart from "../Charts/MonthlyStatisticsChart";
import ProductsByCategoryChart from "../Charts/ProductsByCategoryChart";

// Lưu ý: nếu bạn có setup riêng cho Chart.js (như chartSetup.js),
// hãy chắc chắn file này được import trước (nếu cần)
import "../../utils/chartSetup";

const Dashboard = () => {
  return (
    <Container fluid style={{ padding: "20px", background: "#f0f2f5" }}>
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Row 1: một số biểu đồ */}
      <Row className="gy-4">
        <Col md={4}>
          <ReviewStatisticsChart />
          <TotalProductsChart />
          <TopSellingProductsChart />
          <ProductsByCategoryChart />
          <CustomerStatisticsChart />
        </Col>
        <Col md={4}>
          <CustomerStatisticsChart />
          <MonthlyStatisticsChart />
        </Col>
        <Col md={4}>
          <OrderStatusChart />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
