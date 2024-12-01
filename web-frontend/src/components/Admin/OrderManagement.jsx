import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import OrderForm from "./OrderForm";
import ToastNotification from "../ToastNotification/ToastNotification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/order";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "",
  });

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

  return (
    <>
      <div className="container mt-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Order Management</h1>
          <button className="btn btn-primary" onClick={handleAddOrder}>
            Add New Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="table-responsive">
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
                    <td>{order.total}</td>
                    <td>{order.paymentStatus}</td>
                    <td>{order.shippingStatus}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="Actions">
                      <button
                        className="btn btn-warning btn-sm me-2 btn-edit"
                        onClick={() => handleEditOrder(order)}
                      >
                        Edit
                      </button>
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
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default ManageOrders;
