// src/components/ManageOrders/ManageOrders.jsx

import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import OrderForm from "./OrderForm";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./OrderManagement.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "info",
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Để hiển thị chi tiết đơn hàng
  const [detailOrder, setDetailOrder] = useState(null);

  // Các đơn hàng được chọn để xác nhận hàng loạt
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Trạng thái lọc
  const [filterOrderId, setFilterOrderId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async (params = {}) => {
    setLoadingOrders(true);
    try {
      const response = await apiClient.get("/order/admin/all", { params });
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setToast({
        show: true,
        message: "Không thể tải danh sách đơn hàng",
        variant: "danger",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (filterOrderId) params.orderId = filterOrderId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    fetchOrders(params);
  };

  const clearFilters = () => {
    setFilterOrderId("");
    setStartDate("");
    setEndDate("");
    fetchOrders();
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?"))
      return;
    try {
      await apiClient.delete(`/order/admin/${orderId}`);
      setToast({
        show: true,
        message: "Xóa đơn hàng thành công",
        variant: "success",
      });
      applyFilters();
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      setToast({
        show: true,
        message: "Không thể xóa đơn hàng",
        variant: "danger",
      });
    }
  };

  const handleSaveOrder = () => {
    setShowModal(false);
    applyFilters();
  };

  const handleConfirmOrder = async (orderId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xác nhận đơn hàng này và chuyển sang trạng thái đang giao không?"
      )
    )
      return;

    setUpdatingOrderId(orderId);
    try {
      const response = await apiClient.patch(`/order/admin/${orderId}`, {
        shippingStatus: "shipping",
      });

      if (response.status === 200) {
        setToast({
          show: true,
          message: "Xác nhận đơn hàng và chuyển sang đang giao thành công",
          variant: "success",
        });
        applyFilters();
      } else {
        throw new Error("Xác nhận đơn hàng thất bại");
      }
    } catch (error) {
      console.error("Lỗi xác nhận đơn hàng:", error);
      setToast({
        show: true,
        message: "Không thể xác nhận đơn hàng",
        variant: "danger",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Xác nhận nhiều đơn hàng
  const handleConfirmMultipleOrders = async () => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xác nhận ${selectedOrders.length} đơn hàng đã chọn không?`
      )
    )
      return;

    for (const orderId of selectedOrders) {
      try {
        await apiClient.patch(`/order/admin/${orderId}`, {
          shippingStatus: "shipping",
        });
      } catch (error) {
        console.error("Lỗi xác nhận đơn hàng:", error);
        setToast({
          show: true,
          message: `Không thể xác nhận đơn hàng ${orderId}`,
          variant: "danger",
        });
      }
    }
    setToast({
      show: true,
      message: "Đã xác nhận các đơn hàng được chọn",
      variant: "success",
    });
    setSelectedOrders([]);
    applyFilters();
  };

  const getPaymentStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-success text-white p-2 rounded";
      case "unpaid":
        return "bg-warning text-dark p-2 rounded";
      case "cancelled":
        return "bg-danger text-white p-2 rounded";
      default:
        return "bg-secondary text-white p-2 rounded";
    }
  };

  const getShippingStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-warning text-dark p-2 rounded";
      case "shipping":
        return "bg-info text-white p-2 rounded";
      case "shipped":
        return "bg-success text-white p-2 rounded";
      case "cancelled":
        return "bg-danger text-white p-2 rounded";
      default:
        return "bg-secondary text-white p-2 rounded";
    }
  };

  // Tách đơn hàng "processing" khỏi những đơn khác
  const processingOrders = orders.filter(
    (order) => order.shippingStatus.toLowerCase() === "processing"
  );
  const otherOrders = orders.filter(
    (order) => order.shippingStatus.toLowerCase() !== "processing"
  );

  const handleDetailOrder = (order) => {
    setDetailOrder(order);
  };

  const closeDetailModal = () => {
    setDetailOrder(null);
  };

  const handleCheckboxChange = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Helper function to format currency in VND
  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <>
      <div className="container mt-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Quản lý đơn hàng</h1>
        </div>

        {/* Filter Section */}
        <div className="card mb-4 p-3">
          <div className="row mb-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo Mã đơn hàng"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-center">
              <button className="btn btn-primary me-2" onClick={applyFilters}>
                Lọc
              </button>
              <button className="btn btn-secondary" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {loadingOrders ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Bảng các đơn hàng đang "processing" (chờ xác nhận) */}
            {processingOrders.length > 0 && (
              <div className="mb-5">
                <h2>Đơn hàng chờ xác nhận</h2>
                <div className="d-flex justify-content-end mb-2">
                  {selectedOrders.length > 0 && (
                    <button
                      className="btn btn-success"
                      onClick={handleConfirmMultipleOrders}
                    >
                      Xác nhận đơn hàng đã chọn
                    </button>
                  )}
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>Chọn</th>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái giao hàng</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processingOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => handleCheckboxChange(order._id)}
                            />
                          </td>
                          <td>{order._id}</td>
                          <td>{order.user?.name || "N/A"}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>
                            <span
                              className={getPaymentStatusClasses(
                                order.paymentStatus
                              )}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span
                              className={getShippingStatusClasses(
                                order.shippingStatus
                              )}
                            >
                              {order.shippingStatus}
                            </span>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="Actions">
                            <button
                              className="btn btn-info btn-sm me-2"
                              onClick={() => handleDetailOrder(order)}
                            >
                              Xem chi tiết
                            </button>

                            <button
                              className="btn btn-success btn-sm me-2 btn-confirm"
                              onClick={() => handleConfirmOrder(order._id)}
                              disabled={updatingOrderId === order._id}
                            >
                              {updatingOrderId === order._id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "Xác nhận"
                              )}
                            </button>

                            <button
                              className="btn btn-warning btn-sm me-2 btn-edit"
                              onClick={() => handleEditOrder(order)}
                            >
                              Sửa
                            </button>

                            <button
                              className="btn btn-danger btn-sm btn-delete"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bảng các đơn hàng còn lại */}
            <h2>Danh sách đơn hàng khác</h2>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái giao hàng</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {otherOrders.length > 0 ? (
                    otherOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user?.name || "N/A"}</td>
                        <td>{formatCurrency(order.total)}</td>
                        <td>
                          <span
                            className={getPaymentStatusClasses(
                              order.paymentStatus
                            )}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getShippingStatusClasses(
                              order.shippingStatus
                            )}
                          >
                            {order.shippingStatus}
                          </span>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="Actions">
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => handleDetailOrder(order)}
                          >
                            Xem chi tiết
                          </button>

                          <button
                            className="btn btn-warning btn-sm me-2 btn-edit"
                            onClick={() => handleEditOrder(order)}
                          >
                            Sửa
                          </button>

                          <button
                            className="btn btn-danger btn-sm btn-delete"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Không có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Form (Thêm/Sửa đơn hàng) */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedOrder ? "Sửa đơn hàng" : "Thêm đơn hàng mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <OrderForm
                  order={selectedOrder}
                  onSuccess={handleSaveOrder}
                  onCancel={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chi tiết đơn hàng */}
      {detailOrder && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Row 1: User Info & Shipping Address */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h5>Thông tin khách hàng</h5>
                    <p>
                      <strong>Tên:</strong> {detailOrder.user?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {detailOrder.user?.email || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h5>Địa chỉ giao hàng</h5>
                    <p>
                      <strong>Tên người nhận:</strong>{" "}
                      {detailOrder.shippingAddress?.name}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong>{" "}
                      {detailOrder.shippingAddress?.phone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>{" "}
                      {detailOrder.shippingAddress?.address}
                    </p>
                  </div>
                </div>

                {/* Row 2: Products Table */}
                <h5>Danh sách sản phẩm</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailOrder.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Tổng đơn hàng:</strong>
                        </td>
                        <td>
                          <strong>{formatCurrency(detailOrder.total)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeDetailModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        variant={toast.variant || "info"}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default ManageOrders;
