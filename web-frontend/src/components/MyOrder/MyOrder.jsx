// src/components/MyOrder/MyOrders.jsx

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
  const [filterStatus, setFilterStatus] = useState("processing");

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
      setRefundCheckResult(null);
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

      const updatedOrderResponse = await apiClient.get(
        `/order/${orderIdToCancel}`
      );
      setSelectedOrder(updatedOrderResponse.data);

      if (selectedOrder && selectedOrder._id === orderIdToCancel) {
        setSelectedOrder(null);
        setShowModal(false);
      }

      alert(
        "Đơn hàng của bạn đã được hủy. Nếu đơn hàng là thanh toán trực tuyến, bạn có thể kiểm tra tình trạng hoàn tiền trong chi tiết đơn hàng hoặc liên hệ với nhân viên tư vấn nếu cần hỗ trợ"
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

  const handleMarkAsReceived = async (orderId) => {
    try {
      await apiClient.patch(`/order/admin/${orderId}`, {
        shippingStatus: "shipped",
      });

      alert("Cảm ơn bạn! Đơn hàng đã được đánh dấu là đã nhận.");
      fetchOrders();
    } catch (error) {
      console.error("Error marking order as received:", error);
      alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
    }
  };

  if (!auth.user) {
    return (
      <p className="my-order-page-no-login text-center">
        Bạn cần đăng nhập để xem đơn hàng của mình.
      </p>
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

  // Hàm chuyển đổi trạng thái hoàn tiền sang tiếng Việt
  const getRefundStatusText = (status, paymentMethod) => {
    // Nếu không có thông tin refund hoặc status là null thì in ra "Đơn không có thông tin hoàn tiền"
    if (!status || status === "null") {
      return "Đơn không có thông tin hoàn tiền";
    }
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "processing":
        return "Đang xử lý";
      default:
        return "Đơn không có thông tin hoàn tiền";
    }
  };

  return (
    <div className="my-order-page-container">
      {/* Main Content */}
      <div className="container my-order-page-container-inner my-4">
        <h1 className="my-order-page-title text-center">Đơn hàng của tôi</h1>

        {/* Search and Filter */}
        <div className="my-order-page-search-filter d-flex flex-column flex-md-row justify-content-between align-items-center my-3">
          <div className="my-order-page-search-group d-flex mb-2 mb-md-0">
            <input
              className="my-order-page-search-input form-control me-2"
              placeholder="Tìm kiếm theo mã đơn hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="my-order-page-clear-btn btn btn-outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              Xóa
            </button>
          </div>

          <div className="my-order-page-filter-group">
            <select
              className="my-order-page-filter-select form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="shipped">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
              <option value="">Tất cả trạng thái</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="my-order-page-loading text-center my-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải đơn hàng...</span>
            </div>
          </div>
        ) : (
          <div className="my-order-page-orders row">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="my-order-page-order-card col-md-6 col-lg-4 mb-4"
                >
                  <div className="card my-order-page-card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title my-order-page-order-id">
                        Mã đơn hàng: {order._id}
                      </h5>
                      <h6 className="card-subtitle mb-2 text-muted my-order-page-order-date">
                        Ngày đặt:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </h6>
                      <p className="card-text my-order-page-order-status">
                        <strong>Trạng thái: </strong>
                        <span
                          className={`badge bg-${getStatusBadgeVariant(
                            order.shippingStatus
                          )}`}
                        >
                          {order.shippingStatus}
                        </span>
                      </p>
                      <p className="card-text my-order-page-order-total">
                        <strong>Tổng tiền: </strong>
                        {order.total.toLocaleString()} đ
                      </p>
                      {order.refund && (
                        <p className="card-text my-order-page-order-refund">
                          <strong>Tình trạng hoàn tiền: </strong>
                          <span
                            className={`badge bg-${getStatusBadgeVariant(
                              order.refund.status
                            )}`}
                          >
                            {getRefundStatusText(
                              order.refund.status,
                              order.payment?.method
                            )}
                          </span>
                        </p>
                      )}
                      {!order.refund && (
                        <p className="card-text my-order-page-order-refund">
                          <strong>Tình trạng hoàn tiền: </strong>
                          <span className="badge bg-secondary">
                            Đơn không có thông tin hoàn tiền
                          </span>
                        </p>
                      )}

                      <div className="mt-auto">
                        <button
                          className="my-order-page-view-details-btn btn btn-primary me-2"
                          onClick={() => viewOrderDetails(order._id)}
                        >
                          Xem chi tiết
                        </button>
                        {order.shippingStatus === "processing" && (
                          <button
                            className="my-order-page-cancel-order-btn btn btn-danger"
                            onClick={() => openCancelModal(order)}
                          >
                            Hủy đơn hàng
                          </button>
                        )}
                        {/* ( Mới Thêm ) Nút "Tôi đã nhận được hàng" */}
                        {order.shippingStatus === "shipping" && (
                          <button
                            className="btn btn-success mt-2"
                            onClick={() => handleMarkAsReceived(order._id)}
                          >
                            Tôi đã nhận được hàng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="my-order-page-no-orders text-center">
                Không có đơn hàng nào.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className={`my-order-page-modal modal ${showModal ? "show" : ""}`}
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
                <div className="container-fluid">
                  {/* Hàng 1: 2 cột */}
                  <div className="row">
                    {/* Cột trái: Thông tin đơn hàng và hoàn tiền */}
                    <div className="col-md-6">
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
                      <h5 className="my-order-page-modal-section-title">
                        Thông tin hoàn tiền:
                      </h5>
                      {selectedOrder.refund && selectedOrder.refund.status ? (
                        <>
                          <p>
                            <strong>Tình trạng hoàn tiền:</strong>{" "}
                            <span
                              className={`badge bg-${getStatusBadgeVariant(
                                selectedOrder.refund.status
                              )}`}
                            >
                              {getRefundStatusText(
                                selectedOrder.refund.status,
                                selectedOrder.payment?.method
                              )}
                            </span>
                          </p>
                          {selectedOrder.refund.mRefundId && (
                            <p>
                              <strong>Mã hoàn tiền (mRefundId):</strong>{" "}
                              {selectedOrder.refund.mRefundId}
                            </p>
                          )}
                          <button
                            className="my-order-page-check-refund-btn btn btn-info"
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
                                    {getRefundStatusText(
                                      refundCheckResult.refundStatus,
                                      selectedOrder.payment?.method
                                    )}
                                  </p>
                                  <p>
                                    <strong>Thông báo:</strong>{" "}
                                    {refundCheckResult.message}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <p>Đơn không có thông tin hoàn tiền</p>
                      )}
                    </div>

                    {/* Cột phải: Địa chỉ giao hàng */}
                    <div className="col-md-6">
                      <h5 className="my-order-page-modal-section-title">
                        Địa chỉ giao hàng:
                      </h5>
                      <p>
                        <strong>Tên:</strong>{" "}
                        {selectedOrder.shippingAddress.name}
                      </p>
                      <p>
                        <strong>Điện thoại:</strong>{" "}
                        {selectedOrder.shippingAddress.phone}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong>{" "}
                        {selectedOrder.shippingAddress.address}
                      </p>
                      {selectedOrder.shippingStatus === "processing" && (
                        <button
                          className="my-order-page-modal-cancel-btn btn btn-danger"
                          onClick={() => openCancelModal(selectedOrder)}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hàng 2: Bảng danh sách sản phẩm */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <h5 className="my-order-page-modal-section-title">
                        Sản phẩm:
                      </h5>
                      <div className="table-responsive">
                        <table className="table my-order-page-modal-table">
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="my-order-page-modal-close-btn btn btn-secondary"
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
        className={`my-order-page-cancel-modal modal ${
          showCancelModal ? "show" : ""
        }`}
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
                className="my-order-page-cancel-input form-control"
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
                className="my-order-page-cancel-modal-close-btn btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="my-order-page-cancel-confirm-btn btn btn-danger"
                onClick={confirmCancelOrder}
              >
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
