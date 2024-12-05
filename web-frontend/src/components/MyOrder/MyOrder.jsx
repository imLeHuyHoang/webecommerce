import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useAuth } from "../../context/AuthContext";
import "./MyOrder.css"; // Custom CSS for additional styling
import "bootstrap/dist/css/bootstrap.min.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState(""); // Default to "all" statuses
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState("");
  const [confirmOrderId, setConfirmOrderId] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [refundCheckResult, setRefundCheckResult] = useState(null);

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
      setRefundCheckResult(null); // Reset previous refund status
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const openCancelModal = (order) => {
    setOrderIdToCancel(order._id);
    setConfirmOrderId("");
    setCancelError("");
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (confirmOrderId !== orderIdToCancel) {
      setCancelError("Mã đơn hàng không khớp. Vui lòng nhập chính xác.");
      return;
    }
    try {
      await apiClient.patch(`/order/${orderIdToCancel}/cancel`);
      setShowCancelModal(false);
      fetchOrders();

      // Fetch the updated order details to include refund information
      const updatedOrderResponse = await apiClient.get(
        `/order/${orderIdToCancel}`
      );
      setSelectedOrder(updatedOrderResponse.data);

      if (selectedOrder && selectedOrder._id === orderIdToCancel) {
        setSelectedOrder(null);
        setShowModal(false);
      }

      alert(
        "Yêu cầu hoàn tiền đang được xử lý. Bạn có thể kiểm tra tình trạng refund trong chi tiết đơn hàng."
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      setCancelError("Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  const checkRefundStatus = async () => {
    if (!selectedOrder || !selectedOrder._id) {
      return;
    }
    try {
      setRefundCheckResult(null); // Reset previous refund status
      const response = await apiClient.get(
        `/order/${selectedOrder._id}/refund-status`
      );
      setRefundCheckResult(response.data);

      // Cập nhật trạng thái hoàn tiền cho đơn hàng trong danh sách orders
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? {
                ...order,
                refund: { ...order.refund, status: response.data.refundStatus },
              }
            : order
        )
      );

      // Cập nhật trạng thái hoàn tiền trong selectedOrder
      setSelectedOrder((prevOrder) => ({
        ...prevOrder,
        refund: { ...prevOrder.refund, status: response.data.refundStatus },
      }));
    } catch (error) {
      console.error("Error checking refund status:", error);
      setRefundCheckResult({
        error:
          "Có lỗi xảy ra khi kiểm tra tình trạng refund. Vui lòng thử lại.",
      });
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
      case "shipping":
        return "info";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      case "success":
        return "success";
      case "failed":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      {/* Main Content */}
      <div className="container my-4">
        <h1 className="text-center">Đơn hàng của tôi</h1>

        {/* Search and Filter */}
        <div className="d-flex justify-content-between align-items-center my-3">
          <div className="input-group w-50">
            <input
              className="form-control"
              placeholder="Tìm kiếm theo mã đơn hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              Xóa
            </button>
          </div>

          <select
            className="form-select w-25"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="shipped">Đã giao</option>
            <option value="delivered">Đã nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center my-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải đơn hàng...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order._id} className="col-md-4 mb-4">
                  <div className="card order-card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Mã đơn hàng: {order._id}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Ngày đặt:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </h6>
                      <p className="card-text">
                        <strong>Trạng thái: </strong>
                        <span
                          className={`badge bg-${getStatusBadgeVariant(
                            order.shippingStatus
                          )}`}
                        >
                          {order.shippingStatus}
                        </span>
                      </p>
                      <p className="card-text">
                        <strong>Tổng tiền: </strong>
                        {order.total.toLocaleString()} đ
                      </p>
                      {order.refund && order.refund.status && (
                        <p className="card-text">
                          <strong>Tình trạng hoàn tiền: </strong>
                          <span
                            className={`badge bg-${getStatusBadgeVariant(
                              order.refund.status
                            )}`}
                          >
                            {order.refund.status}
                          </span>
                        </p>
                      )}
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => viewOrderDetails(order._id)}
                      >
                        Xem chi tiết
                      </button>
                      {order.shippingStatus === "processing" && (
                        <button
                          className="btn btn-danger"
                          onClick={() => openCancelModal(order)}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Không có đơn hàng nào.</p>
            )}
          </div>
        )}

        {/* Refund Status Checker Removed */}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className={`modal ${showModal ? "show" : ""}`}
          style={{ display: showModal ? "block" : "none" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Mã đơn hàng:</strong> {selectedOrder._id}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={`badge bg-${getStatusBadgeVariant(
                      selectedOrder.shippingStatus
                    )}`}
                  >
                    {selectedOrder.shippingStatus}
                  </span>
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedOrder.total.toLocaleString()} đ
                </p>
                {selectedOrder.refund && selectedOrder.refund.status && (
                  <>
                    <h5>Thông tin hoàn tiền:</h5>
                    <p>
                      <strong>Tình trạng hoàn tiền:</strong>{" "}
                      <span
                        className={`badge bg-${getStatusBadgeVariant(
                          selectedOrder.refund.status
                        )}`}
                      >
                        {selectedOrder.refund.status}
                      </span>
                    </p>
                    {selectedOrder.refund.mRefundId && (
                      <p>
                        <strong>Mã hoàn tiền (mRefundId):</strong>{" "}
                        {selectedOrder.refund.mRefundId}
                      </p>
                    )}
                    <button
                      className="btn btn-info"
                      onClick={checkRefundStatus}
                    >
                      Kiểm tra tình trạng refund
                    </button>
                    {refundCheckResult && (
                      <div className="mt-3">
                        {refundCheckResult.error ? (
                          <div className="alert alert-danger">
                            {refundCheckResult.error}
                          </div>
                        ) : (
                          <div className="alert alert-info">
                            <p>
                              <strong>Mã đơn hàng:</strong>{" "}
                              {refundCheckResult.orderId}
                            </p>
                            <p>
                              <strong>Tình trạng hoàn tiền:</strong>{" "}
                              {refundCheckResult.refundStatus}
                            </p>
                            <p>
                              <strong>Thông báo:</strong>{" "}
                              {refundCheckResult.message}
                            </p>
                            <p>
                              <strong>Mã hoàn tiền (mRefundId):</strong>{" "}
                              {refundCheckResult.mRefundId}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

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
                        <td>{item.product.name}</td>
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
                  <strong>Điện thoại:</strong>{" "}
                  {selectedOrder.shippingAddress.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedOrder.shippingAddress.address}
                </p>
              </div>
              <div className="modal-footer">
                {selectedOrder.shippingStatus === "processing" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => openCancelModal(selectedOrder)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <div
        className={`modal ${showCancelModal ? "show" : ""}`}
        style={{ display: showCancelModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận hủy đơn hàng</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCancelModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn hủy đơn hàng này không? Nếu muốn hủy, vui
                lòng nhập mã đơn hàng <strong>{orderIdToCancel}</strong> vào ô
                bên dưới để xác nhận.
              </p>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã đơn hàng để xác nhận"
                value={confirmOrderId}
                onChange={(e) => setConfirmOrderId(e.target.value)}
              />
              {cancelError && (
                <div className="alert alert-danger mt-2">{cancelError}</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn btn-danger" onClick={confirmCancelOrder}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
