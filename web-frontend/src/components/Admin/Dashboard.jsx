import React, { useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components and scales
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  // Sample data for charts
  const dataLine = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Revenue",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const dataBar = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "New Users",
        data: [12, 19, 3, 5, 2, 3, 9],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const dataDoughnut = {
    labels: ["Phones", "Laptops", "Tablets"],
    datasets: [
      {
        data: [33, 33, 34],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  useEffect(() => {
    return () => {
      // Cleanup chart instances on component unmount
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      if (doughnutChartRef.current) {
        doughnutChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Dashboard</h1>
        </Col>
      </Row>
      <Row>
        <Col lg={4} md={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>New Tickets</Card.Title>
              <Card.Text>43</Card.Text>
              <Button variant="outline-success">+6% Since Last Week</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Closed Today</Card.Title>
              <Card.Text>17</Card.Text>
              <Button variant="outline-danger">-3% Since Yesterday</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>New Replies</Card.Title>
              <Card.Text>7</Card.Text>
              <Button variant="outline-success">+9% Since Last Week</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Revenue Over Time</Card.Title>
              <Line ref={lineChartRef} data={dataLine} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>New Users</Card.Title>
              <Bar ref={barChartRef} data={dataBar} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={4} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Product Distribution</Card.Title>
              <Doughnut ref={doughnutChartRef} data={dataDoughnut} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
