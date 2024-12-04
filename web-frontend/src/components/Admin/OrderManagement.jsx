// src/components/ManageOrders/ManageOrders.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import OrderForm from "./OrderForm";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./OrderManagement.css"; // Optional: If you plan to add custom CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/order";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "info", // Default variant
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // To track which order is being updated

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/admin/all`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setToast({
        show: true,
        message: "Failed to load orders",
        variant: "danger",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await apiClient.delete(`${API_BASE_URL}/admin/${orderId}`);
      setToast({
        show: true,
        message: "Order deleted successfully",
        variant: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      setToast({
        show: true,
        message: "Failed to delete order",
        variant: "danger",
      });
    }
  };

  const handleSaveOrder = () => {
    setShowModal(false);
    fetchOrders();
  };

  // Handler to Confirm Order
  const handleConfirmOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to confirm this order and start shipping?"
      )
    )
      return;

    setUpdatingOrderId(orderId);
    try {
      const response = await apiClient.patch(
        `${API_BASE_URL}/admin/${orderId}`,
        {
          shippingStatus: "shipping",
        }
      );

      // Check if response is successful
      if (response.status === 200) {
        setToast({
          show: true,
          message: "Order confirmed and shipping started successfully",
          variant: "success",
        });
        fetchOrders();
      } else {
        throw new Error("Failed to confirm order");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      setToast({
        show: true,
        message: "Failed to confirm order",
        variant: "danger",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper function to get Bootstrap classes for payment status
  const getPaymentStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-success text-white p-2 rounded"; // Green background, white text
      case "unpaid":
        return "bg-warning text-dark p-2 rounded"; // Yellow background, dark text
      case "cancelled":
        return "bg-danger text-white p-2 rounded"; // Red background, white text
      default:
        return "bg-secondary text-white p-2 rounded"; // Default gray background
    }
  };

  // Helper function to get Bootstrap classes for shipping status
  const getShippingStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-warning text-dark p-2 rounded"; // Yellow background, dark text
      case "shipping":
        return "bg-info text-white p-2 rounded"; // Blue background, white text
      case "shipped":
        return "bg-success text-white p-2 rounded"; // Green background, white text
      case "cancelled":
        return "bg-danger text-white p-2 rounded"; // Red background, white text
      default:
        return "bg-secondary text-white p-2 rounded"; // Default gray background
    }
  };

  return (
    <>
      <div className="container mt-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Order Management</h1>
          {/* <button className="btn btn-primary" onClick={handleAddOrder}>
            Add New Order
          </button> */}
        </div>

        {/* Orders Table */}
        <div className="table-responsive">
          {loadingOrders ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Shipping Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.user?.name || "N/A"}</td>
                      <td>${order.total.toFixed(2)}</td>
                      {/* Apply dynamic classes to Payment Status */}
                      <td>
                        <span
                          className={getPaymentStatusClasses(
                            order.paymentStatus
                          )}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      {/* Apply dynamic classes to Shipping Status */}
                      <td>
                        <span
                          className={getShippingStatusClasses(
                            order.shippingStatus
                          )}
                        >
                          {order.shippingStatus}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="Actions">
                        {/* Confirm Order Button */}
                        {order.shippingStatus.toLowerCase() ===
                          "processing" && (
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
                              "Confirm Order"
                            )}
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          className="btn btn-warning btn-sm me-2 btn-edit"
                          onClick={() => handleEditOrder(order)}
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn btn-danger btn-sm btn-delete"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form for Order */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedOrder ? "Edit Order" : "Add New Order"}
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

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        variant={toast.variant || "info"} // Ensure variant is always set
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default ManageOrders;
