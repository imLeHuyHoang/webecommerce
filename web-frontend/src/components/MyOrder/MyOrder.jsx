import React, { useState, useEffect } from "react";
import "./MyOrder.css";

// Giữ ordersData bên trong component
const ordersData = [
  {
    orderId: "12345",
    products: [{ name: "iPhone 14 Pro Max" }, { name: "MacBook Pro M1" }],
    totalAmount: 3500.0,
    status: "Delivered",
  },
  {
    orderId: "67890",
    products: [{ name: "Samsung Galaxy S22 Ultra" }],
    totalAmount: 1099.99,
    status: "Shipped",
  },
];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  // Không cần dùng props nữa
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, []);

  return (
    <div className="my_orders_container">
      <h1 className="my_orders_title">My Orders</h1>
      <table className="my_orders_table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product Names</th>
            <th>Total Amount</th>
            <th>Order Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <tr key={index}>
                <td>{order.orderId}</td>
                <td>
                  {order.products.map((product, idx) => (
                    <div key={idx}>{product.name}</div>
                  ))}
                </td>
                <td>${order.totalAmount}</td>
                <td>{order.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrders;
