// src/pages/CartPage/CartPage.jsx

import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (auth.user) {
          // Người dùng đã đăng nhập, lấy giỏ hàng từ server
          const response = await apiClient.get("/cart");
          setCartItems(response.data.products);
        } else {
          // Người dùng chưa đăng nhập, lấy giỏ hàng từ localStorage
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          setCartItems(localCart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [auth.user]);

  const updateQuantity = async (productId, increment) => {
    try {
      if (auth.user) {
        // Cập nhật giỏ hàng trên server
        await apiClient.patch(
          `/cart/${productId}/${increment > 0 ? "increase" : "decrease"}`
        );
      } else {
        // Cập nhật giỏ hàng trong localStorage
        const updatedCart = cartItems.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + increment }
            : item
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      // Cập nhật lại giỏ hàng
      updateCart();
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + increment }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      if (auth.user) {
        // Xóa sản phẩm khỏi giỏ hàng trên server
        await apiClient.delete(`/cart/${productId}`);
      } else {
        // Xóa sản phẩm khỏi giỏ hàng trong localStorage
        const updatedCart = cartItems.filter(
          (item) => item.product._id !== productId
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      // Cập nhật lại giỏ hàng
      updateCart();
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product._id !== productId)
      );
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    navigate("/checkout", { state: { cartItems } });
  };

  return (
    <div className="container mt-4">
      <h2>Shopping Cart</h2>
      {loading ? (
        <div>Loading cart...</div>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.product._id}>
                <div className="cart-item-image">
                  <img
                    src={`http://localhost:5000/products/${item.product.images[0]}`}
                    alt={item.product.title}
                  />
                </div>
                <div className="cart-item-info">
                  <h5>{item.product.title}</h5>
                  <p>{formatPrice(item.product.price)}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        item.quantity > 1 &&
                        updateQuantity(item.product._id, -1)
                      }
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="remove-item-button"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h4>Tổng kết đơn hàng</h4>
            <p>Tổng tiền: {formatPrice(getTotalPrice())}</p>
            <button
              className="btn btn-primary"
              onClick={handleProceedToCheckout}
            >
              Tiến hành thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
