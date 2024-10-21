import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../utils/api-client";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Lấy số lượng giỏ hàng khi ứng dụng khởi chạy
  useEffect(() => {
    fetchCartCount();
  }, []);

  // Hàm lấy số lượng giỏ hàng từ server hoặc localStorage
  const fetchCartCount = async () => {
    let count = 0;
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const response = await apiClient.get("/cart", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        count = response.data.products.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      count = localCart.reduce((total, item) => total + item.quantity, 0);
    }
    setCartCount(count);
  };

  // Hàm tăng số lượng giỏ hàng
  const incrementCartCount = (quantity) => {
    setCartCount((prevCount) => prevCount + quantity);
  };

  // Hàm giảm số lượng giỏ hàng
  const decrementCartCount = (quantity) => {
    setCartCount((prevCount) => Math.max(prevCount - quantity, 0));
  };

  // Hàm cập nhật lại số lượng giỏ hàng từ server hoặc localStorage
  const updateCart = async () => {
    await fetchCartCount(); // Đồng bộ số lượng giỏ hàng sau mỗi thay đổi
  };

  return (
    <CartContext.Provider
      value={{ cartCount, incrementCartCount, decrementCartCount, updateCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
