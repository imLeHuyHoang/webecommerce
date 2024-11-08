// MyOrders.jsx

import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useAuth } from "../../context/AuthContext";
import "./MyOrder.css"; // Custom CSS for additional styling
import {
  Navbar,
  Nav,
  Container,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap"; // Import Bootstrap components

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (auth.user) {
      fetchOrders();
    }
  }, [auth.user]);

  useEffect(() => {
    // Filter orders based on search term and status
    const filtered = orders.filter((order) => {
      const matchesSearch = order._id.includes(searchTerm);
      const matchesStatus = filterStatus
        ? order.shippingStatus === filterStatus
        : true;
      return matchesSearch && matchesStatus;
    });
    setFilteredOrders(filtered);
  }, [searchTerm, filterStatus, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/order");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await apiClient.get(`/order/${orderId}`);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await apiClient.patch(`/order/${orderId}/cancel`);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
          setShowModal(false);
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  };

  if (!auth.user) {
    return (
      <p className="text-center">Bạn cần đăng nhập để xem đơn hàng của mình.</p>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "processing":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      {/* Main Content */}
      <Container className="my-4">
        <h1 className="text-center">Đơn hàng của tôi</h1>

        {/* Search and Filter */}
        <div className="d-flex justify-content-between align-items-center my-3">
          <InputGroup className="w-50">
            <Form.Control
              placeholder="Tìm kiếm theo mã đơn hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              Xóa
            </Button>
          </InputGroup>

          <Form.Select
            className="w-25"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao hàng</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </Form.Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang tải đơn hàng...</span>
            </Spinner>
          </div>
        ) : (
          <div className="row">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order._id} className="col-md-4 mb-4">
                  <Card className="order-card h-100">
                    <Card.Body>
                      <Card.Title>Mã đơn hàng: {order._id}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Ngày đặt:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>Trạng thái: </strong>
                        <Badge bg={getStatusBadgeVariant(order.shippingStatus)}>
                          {order.shippingStatus}
                        </Badge>
                      </Card.Text>
                      <Card.Text>
                        <strong>Tổng tiền: </strong>
                        {order.total.toLocaleString()} đ
                      </Card.Text>
                      <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => viewOrderDetails(order._id)}
                      >
                        Xem chi tiết
                      </Button>
                      {order.shippingStatus === "processing" && (
                        <Button
                          variant="danger"
                          onClick={() => cancelOrder(order._id)}
                        >
                          Hủy đơn hàng
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ))
            ) : (
              <p className="text-center">Không có đơn hàng nào.</p>
            )}
          </div>
        )}
      </Container>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết đơn hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Mã đơn hàng:</strong> {selectedOrder._id}
            </p>
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <Badge bg={getStatusBadgeVariant(selectedOrder.shippingStatus)}>
                {selectedOrder.shippingStatus}
              </Badge>
            </p>
            <p>
              <strong>Tổng tiền:</strong> {selectedOrder.total.toLocaleString()}{" "}
              đ
            </p>
            <h5>Sản phẩm:</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products.map((item) => (
                  <tr key={item.product._id}>
                    <td>{item.product.title}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h5>Địa chỉ giao hàng:</h5>
            <p>
              <strong>Tên:</strong> {selectedOrder.shippingAddress.name}
            </p>
            <p>
              <strong>Điện thoại:</strong> {selectedOrder.shippingAddress.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress.address}
            </p>
          </Modal.Body>
          <Modal.Footer>
            {selectedOrder.shippingStatus === "processing" && (
              <Button
                variant="danger"
                onClick={() => cancelOrder(selectedOrder._id)}
              >
                Hủy đơn hàng
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default MyOrders;
