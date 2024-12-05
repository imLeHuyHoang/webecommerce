import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderForm = ({ order, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    user: "",
    shippingAddress: {
      name: "",
      phone: "",
      address: "",
    },
    products: [],
    total: 0,
    paymentStatus: "unpaid",
    shippingStatus: "processing",
    payment: {
      method: "cod",
      transactionId: "",
      appTransId: "",
      isVerified: false,
    },
    refund: {
      status: "none",
    },
    note: "",
  });

  useEffect(() => {
    if (order) {
      setFormData(order);
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested fields
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (order) {
        // Update order
        await apiClient.patch(
          `${API_BASE_URL}/order/admin/${order._id}`,
          formData
        );
      } else {
        // Create new order
        await apiClient.post(`${API_BASE_URL}/order/create`, formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for order data */}
      <div className="mb-3">
        <label className="form-label">User ID</label>
        <input
          type="text"
          className="form-control"
          name="user"
          value={formData.user}
          onChange={handleChange}
          required
        />
      </div>
      {/* Shipping Address */}
      <div className="mb-3">
        <h5>Shipping Address</h5>
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          name="shippingAddress.name"
          value={formData.shippingAddress.name}
          onChange={handleChange}
          required
        />
        <label className="form-label">Phone</label>
        <input
          type="text"
          className="form-control"
          name="shippingAddress.phone"
          value={formData.shippingAddress.phone}
          onChange={handleChange}
          required
        />
        <label className="form-label">Address</label>
        <input
          type="text"
          className="form-control"
          name="shippingAddress.address"
          value={formData.shippingAddress.address}
          onChange={handleChange}
          required
        />
      </div>
      {/* Other fields like products, payment, etc. */}
      {/* Note: Implement inputs for products array, payment details, etc., as needed */}
      <div className="mb-3">
        <label className="form-label">Total</label>
        <input
          type="number"
          className="form-control"
          name="total"
          value={formData.total}
          onChange={handleChange}
          required
        />
      </div>
      {/* Payment Status */}
      <div className="mb-3">
        <label className="form-label">Payment Status</label>
        <select
          className="form-select"
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={handleChange}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {/* Shipping Status */}
      <div className="mb-3">
        <label className="form-label">Shipping Status</label>
        <select
          className="form-select"
          name="shippingStatus"
          value={formData.shippingStatus}
          onChange={handleChange}
        >
          <option value="processing">Processing</option>
          <option value="shipping">Shipping</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {/* Note */}
      <div className="mb-3">
        <label className="form-label">Note</label>
        <textarea
          className="form-control"
          name="note"
          value={formData.note}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {order ? "Update Order" : "Create Order"}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;
