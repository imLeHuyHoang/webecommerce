import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../utils/api-client";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    let count = 0;
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const response = await apiClient.get("/cart/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        count = response.data.products.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      count = localCart.reduce((total, item) => total + item.quantity, 0);
    }
    setCartCount(count);
  };

  const incrementCartCount = (quantity = 1) => {
    setCartCount((prevCount) => prevCount + quantity);
  };

  const decrementCartCount = (quantity) => {
    setCartCount((prevCount) => Math.max(prevCount - quantity, 0));
  };

  const updateCart = async () => {
    await fetchCartCount();
  };

  return (
    <CartContext.Provider
      value={{ cartCount, incrementCartCount, decrementCartCount, updateCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook để sử dụng CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Export mặc định cho CartProvider
export default CartProvider;
