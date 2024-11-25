// ProductCard.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./ProductCard.css";

function ProductCard({ id, title, price, stock, rating, ratingCount, image }) {
  const { incrementCartCount } = useCart();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const addToCart = async () => {
    const token = localStorage.getItem("accessToken");
    const product = { productId: id, quantity: 1 };

    try {
      if (token) {
        await apiClient.post("/cart", product, {
          headers: { Authorization: `Bearer ${token}` },
        });
        incrementCartCount();
        setToastMessage("Sản phẩm đã được thêm vào giỏ hàng");
      } else {
        setToastMessage("Vui lòng đăng nhập để thêm vào giỏ hàng");
      }
    } catch (error) {
      setToastMessage("Lỗi khi thêm sản phẩm vào giỏ hàng");
    } finally {
      setShowToast(true);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <>
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="product-card">
        <NavLink to={`/product/${id}`} className="product-link">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL.replace(
              "/api",
              ""
            )}/products/${image}`}
            className="product-image"
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-image.png";
            }}
          />
        </NavLink>
        <div className="product-info">
          <p className="product-title">{title}</p>
          <p className="product-price">{formatPrice(price)}</p>
          <div className="product-meta">
            <div className="product-rating">
              {"★".repeat(Math.round(rating))}
              {"☆".repeat(5 - Math.round(rating))}
              <span> ({ratingCount})</span>
            </div>
            <button
              onClick={addToCart}
              className={`add-to-cart-button ${stock > 0 ? "" : "disabled"}`}
              disabled={stock === 0}
            >
              {stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;
