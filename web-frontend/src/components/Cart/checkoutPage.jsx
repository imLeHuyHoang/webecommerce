// src/pages/CheckoutPage/CheckoutPage.jsx

import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CheckoutPage = () => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("zalopay");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Kiểm tra xem location.state và location.state.cartItems có tồn tại không
    if (location.state && location.state.cartItems) {
      setCartItems(location.state.cartItems);
    } else {
      // Nếu không có dữ liệu, có thể lấy từ localStorage hoặc chuyển hướng về trang giỏ hàng
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (localCart.length > 0) {
        setCartItems(localCart);
      } else {
        alert(
          "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng."
        );
        navigate("/cart");
      }
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
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

  const handlePlaceOrder = async () => {
    // Kiểm tra nếu giỏ hàng trống
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }

    // Kiểm tra thông tin giao hàng
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
      return;
    }

    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      shippingAddress: shippingInfo,
      paymentMethod,
      products: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    try {
      // Gửi yêu cầu tạo đơn hàng tới backend
      const response = await apiClient.post("/order", orderData);

      // Trong hàm handlePlaceOrder

      if (paymentMethod === "zalopay") {
        // Nếu thanh toán qua ZaloPay, redirect tới trang thanh toán
        const { orderUrl } = response.data;
        window.location.href = orderUrl;
      } else {
        // Xử lý cho phương thức thanh toán khác (COD)
        navigate("/order-success");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Thanh toán</h2>
      <div className="row">
        {/* Form thông tin giao hàng */}
        <div className="col-md-6">
          <h4>Thông tin giao hàng</h4>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              name="name"
              value={shippingInfo.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              name="address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="form-control"
            >
              <option value="zalopay">ZaloPay</option>
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handlePlaceOrder}>
            Thanh toán
          </button>
        </div>

        {/* Hiển thị thông tin đơn hàng */}
        <div className="col-md-6">
          <h4>Thông tin đơn hàng</h4>
          <div className="order-items">
            {cartItems.map((item) => (
              <div className="order-item" key={item.product._id}>
                <div>{item.product.title}</div>
                <div>
                  {item.quantity} x {formatPrice(item.product.price)}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Tổng tiền: {formatPrice(getTotalPrice())}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
