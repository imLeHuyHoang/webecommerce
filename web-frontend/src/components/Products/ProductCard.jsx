// src/components/ProductPage/ProductCard.jsx
import React from "react";
import { Card, Button, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { useCart } from "../../context/CartContext";
import { ToastContext } from "../ToastNotification/ToastContext";
import "./ProductCard.css";

function ProductCard({ id, title, price, stock, rating, reviewCount, image }) {
  const { incrementCartCount } = useCart();
  const { addToast } = React.useContext(ToastContext);

  const addToCart = async () => {
    const product = { productId: id, quantity: 1 };
    try {
      const token = localStorage.getItem("accessToken");
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

  const formatPrice = (price) =>
    price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${id}`} {...props}>
      {stock > 0 ? "Thêm vào giỏ hàng" : "Sản phẩm đã hết hàng"}
    </Tooltip>
  );

  return (
    <Card className="product-card-container h-100 shadow-sm">
      <NavLink
        to={`/product/${id}`}
        className="text-decoration-none product-card-link"
      >
        <div className="product-card-image-container">
          <Card.Img
            variant="top"
            src={`${import.meta.env.VITE_API_BASE_URL}/products/${image}`}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-image.png";
            }}
            className="product-card-image"
          />
          {stock === 0 && (
            <Badge bg="danger" className="product-card-stock-badge">
              Hết hàng
            </Badge>
          )}
        </div>
      </NavLink>
      <Card.Body className="d-flex flex-column product-card-body">
        <Card.Title className="product-card-title">{title}</Card.Title>
        <Card.Text className="product-card-price">
          {formatPrice(price)}
        </Card.Text>
        <Card.Text className="product-card-stock">
          {stock > 0 ? `Còn ${stock} sản phẩm` : "Hết hàng"}
        </Card.Text>

        <div className="product-card-rating mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className={`fas ${
                i < Math.round(rating) ? "fa-star" : "fa-star-half-alt"
              } text-warning product-card-star-icon`}
            ></i>
          ))}
          <span className="ms-2 product-card-review-count">
            ({rating.toFixed(1)} - {reviewCount} đánh giá)
          </span>
        </div>
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <Button
            variant={stock > 0 ? "primary" : "secondary"}
            onClick={addToCart}
            disabled={stock === 0}
            className="mt-auto product-card-add-to-cart-btn"
          >
            {stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </Button>
        </OverlayTrigger>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
