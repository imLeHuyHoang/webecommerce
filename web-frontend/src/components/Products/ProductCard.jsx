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

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${id}`} {...props}>
      {stock > 0 ? "Thêm vào giỏ hàng" : "Sản phẩm đã hết hàng"}
    </Tooltip>
  );

  return (
    <Card className="product-card h-100 shadow-sm">
      <NavLink to={`/product/${id}`} className="text-decoration-none">
        <div className="image-container">
          <Card.Img
            variant="top"
            src={`${import.meta.env.VITE_API_BASE_URL.replace(
              "/api",
              ""
            )}/products/${image}`}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-image.png";
            }}
            className="product-image"
          />
          {stock === 0 && (
            <Badge bg="danger" className="stock-badge">
              Hết hàng
            </Badge>
          )}
        </div>
      </NavLink>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="product-title">{title}</Card.Title>
        <Card.Text className="product-price">{formatPrice(price)}</Card.Text>
        <div className="product-rating mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className={`fas fa-star${
                i < Math.round(rating) ? "" : "-half-alt"
              } text-warning`}
            ></i>
          ))}
          <span className="ms-2">
            ({rating.toFixed(1)}-{reviewCount} đánh giá)
          </span>
        </div>
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <Button
            variant={stock > 0 ? "primary" : "secondary"}
            onClick={addToCart}
            disabled={stock === 0}
            className="mt-auto add-to-cart-btn"
          >
            {stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </Button>
        </OverlayTrigger>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
