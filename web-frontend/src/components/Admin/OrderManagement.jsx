import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // thêm dữ liệu ví dụ để test
  const tempData = [
    {
      _id: "1",
      user: { name: "John Doe" },
      total: 100,
      status: "processing",
      payment: { method: "credit card" },
      note: "Lorem ipsum dolor sit amet",
    },
    {
      _id: "2",
      user: { name: "Jane Smith" },
      total: 200,
      status: "shipped",
      payment: { method: "paypal" },
      note: "Consectetur adipiscing elit",
    },
    {
      _id: "3",
      user: { name: "Bob Johnson" },
      total: 300,
      status: "delivered",
      payment: { method: "cash" },
      note: "Sed do eiusmod tempor incididunt",
    },
  ];

  useEffect(() => {
    setOrders(tempData);
  }, []);

  useEffect(() => {
    // Fetch all orders when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    fetchOrders();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await axios.patch(`/api/orders/${selectedOrder._id}`, {
        status: statusUpdate,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: statusUpdate }
            : order
        )
      );
      setSelectedOrder(null);
      setStatusUpdate("");
      alert("Order status updated successfully.");
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await axios.patch(`/api/orders/${selectedOrder._id}/cancel`, {
        reason: cancelReason,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: "cancelled" }
            : order
        )
      );
      setSelectedOrder(null);
      setCancelReason("");
      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel order", error);
    }
  };

  return (
    <div className="order-management">
      <h1>Order Management</h1>
      <div className="order-list">
        <h2>Orders List</h2>
        {Array.isArray(orders) && orders.length === 0 ? (
          <p>No orders available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) &&
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user.name}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>
                      <button onClick={() => handleSelectOrder(order)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="order-details">
          <h2>Order Details</h2>
          <p>Order ID: {selectedOrder._id}</p>
          <p>Customer Name: {selectedOrder.user.name}</p>
          <p>Total: ${selectedOrder.total.toFixed(2)}</p>
          <p>Payment Method: {selectedOrder.payment.method}</p>
          <p>Status: {selectedOrder.status}</p>
          <p>Note: {selectedOrder.note}</p>

          <div className="status-update">
            <label>Update Status:</label>
            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <button onClick={handleUpdateStatus}>Update Status</button>
          </div>

          <div className="cancel-order">
            <label>Cancel Reason:</label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation"
            />
            <button onClick={handleCancelOrder}>Cancel Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
