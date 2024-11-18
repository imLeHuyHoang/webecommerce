import React, { useState } from "react";
import "./ProductCard.css";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import ToastNotification from "../ToastNotification/ToastNotification"; // Import ToastNotification

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
      <article className="product_card">
        <div className="product_image">
          <NavLink to={`/product/${id}`}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL.replace(
                "/api",
                ""
              )}/products/${image}`} // Sử dụng biến môi trường
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-image.png";
              }}
            />
          </NavLink>
        </div>
        <div className="product_details">
          <h3 className="product_title">{title}</h3>
          <p className="product_price">{formatPrice(price)}</p>
          <footer className="align_center product_infor_footer">
            <div className="product_rating">{"★" + rating.toFixed(1)}</div>
            <span className="rating_count">({ratingCount} reviews)</span>
          </footer>
          <button
            onClick={addToCart}
            className={`buy_now_button ${stock > 0 ? "" : "disabled"}`}
            disabled={stock === 0}
          >
            <span className="text">
              {stock > 0 ? "Buy Now" : "Out of Stock"}
            </span>
            <span>Add to Cart</span>
          </button>
        </div>
      </article>
    </>
  );
}

export default ProductCard;
