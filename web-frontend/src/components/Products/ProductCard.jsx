import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import ToastNotification from "../ToastNotification/ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProductCard.css";

function ProductCard({
  id,
  title,
  price,
  stock,
  rating,
  ratingCount,
  image,
  description,
  brand,
  category,
}) {
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
        setToastMessage("Added to cart");
      } else {
        setToastMessage("Please login to add to cart");
      }
    } catch (error) {
      setToastMessage("Error adding to cart");
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
        <div className="card shadow-sm">
          <NavLink to={`/product/${id}`}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL.replace(
                "/api",
                ""
              )}/products/${image}`}
              className="card-img-top product-image"
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-image.png";
              }}
            />
          </NavLink>
          <div className="card-body">
            <h5 className="card-title product-title">{title}</h5>
            <p className="card-text product-description text-muted">
              {description}
            </p>
            <p className="product-price text-primary fw-bold">
              {formatPrice(price)}
            </p>
            <p className="card-text">
              <small className="text-muted">Brand: {brand}</small>
            </p>
            <p className="card-text">
              <small className="text-muted">Category: {category.name}</small>
            </p>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-warning product-rating">
                {"★".repeat(Math.round(rating))}
                {"☆".repeat(5 - Math.round(rating))}
                <span className="text-muted"> ({ratingCount})</span>
              </div>
              <button
                onClick={addToCart}
                className={`btn btn-primary btn-sm ${
                  stock > 0 ? "" : "disabled"
                }`}
                disabled={stock === 0}
              >
                {stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;
