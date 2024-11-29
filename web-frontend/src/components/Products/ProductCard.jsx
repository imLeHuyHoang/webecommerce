import React from "react";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import { ToastContext } from "../ToastNotification/ToastContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProductCard.css";

function ProductCard({ id, title, price, stock, rating, ratingCount, image }) {
  const { incrementCartCount } = useCart();
  const { addToast } = React.useContext(ToastContext);

  const addToCart = async () => {
    const token = localStorage.getItem("accessToken");
    const product = { productId: id, quantity: 1 };

    try {
      if (token) {
        await apiClient.post("/cart/add", product, {
          headers: { Authorization: `Bearer ${token}` },
        });
        incrementCartCount();
        addToast("Sản phẩm đã được thêm vào giỏ hàng", "success");
      } else {
        addToast("Vui lòng đăng nhập để thêm vào giỏ hàng", "danger");
      }
    } catch (error) {
      addToast("Lỗi khi thêm sản phẩm vào giỏ hàng", "danger");
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <div className="product-card">
      <NavLink to={`/product/${id}`}>
        <img
          src={`${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}/products/${image}`}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/default-image.png";
          }}
        />
      </NavLink>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-price">Giá: {formatPrice(price)}</p>
        <p className="card-stock">{stock > 0 ? "Còn hàng" : "Hết hàng"}</p>
        <div className="card-rating">
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className={`fas fa-star${
                i < Math.round(rating) ? "" : "-half-alt"
              }`}
            ></i>
          ))}
          <span>
            {rating.toFixed(1)} ({ratingCount} đánh giá)
          </span>
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
  );
}

export default ProductCard;
