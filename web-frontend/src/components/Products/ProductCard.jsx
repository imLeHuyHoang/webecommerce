import React, { useState } from "react";
import "./ProductCard.css";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import ToastNotification from "../../utils/ToastNotification"; // Import ToastNotification

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
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProduct = localCart.find((item) => item.productId === id);

        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          localCart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(localCart));
      }

      incrementCartCount(1);
      setToastMessage("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setToastMessage("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
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
              src={`http://localhost:5000/products/${image}`}
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
          <p className="product_price">${price.toFixed(2)}</p>
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
