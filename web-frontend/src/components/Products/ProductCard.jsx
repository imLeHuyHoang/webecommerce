import React from "react";
import "./ProductCard.css";
import { NavLink } from "react-router-dom";

function ProductCard({ id, title, price, stock, rating, ratingCount, image }) {
  // trả về 1 ngôi sao và bên phải là số điểm đánh giá rating
  const stars = "★" + rating.toFixed(1);

  return (
    <article className="product_card">
      <div className="product_image">
        <NavLink to={`/products/${id}`}>
          <img
            src={
              image && image.length > 0
                ? `http://localhost:5000/products/${image}`
                : "default-image.png" // Sử dụng hình ảnh mặc định nếu không có hình ảnh nào được cung cấp
            }
            alt={title}
          />
        </NavLink>
      </div>
      <div className="product_details">
        <h3 className="product_title">{title}</h3>
        <p className="product_price">${price.toFixed(2)}</p>
        <footer className="align_center product_infor_footer">
          <div className="product_rating">{stars}</div>
          <span className="rating_count">({ratingCount} reviews)</span>
        </footer>
        <button
          className={`buy_now_button ${stock > 0 ? "" : "disabled"}`}
          disabled={stock === 0}
        >
          <span className="text">{stock > 0 ? "Buy Now" : "Out of Stock"}</span>
          <span>Add to Cart</span> {/* Alternate text khi hover */}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
