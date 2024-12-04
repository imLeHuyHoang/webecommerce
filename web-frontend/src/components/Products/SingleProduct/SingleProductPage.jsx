// src/components/SingleProductPage/SingleProductPage.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
  Modal,
  Image,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api-client";
import { useCart } from "../../../context/CartContext";
import ToastNotification from "../../ToastNotification/ToastNotification";
import RatingComponent from "../../RatingandComment/RatingComponent";
import CommentComponent from "../../RatingandComment/CommentComponent";
import "./SingleProductPage.css";

const SingleProductPage = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate(); // For navigation
  const { incrementCartCount } = useCart(); // Cart context
  const [product, setProduct] = useState(null); // Product details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const [quantity, setQuantity] = useState(1); // Quantity selected
  const [mainImage, setMainImage] = useState(""); // Main image to display
  const [currentSlide, setCurrentSlide] = useState(0); // Current slide in image carousel
  const [toastMessage, setToastMessage] = useState(""); // Toast message
  const [showToast, setShowToast] = useState(false); // Show/hide toast
  const [showModal, setShowModal] = useState(false); // Show/hide attributes modal

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/product/${id}`); // Fetch product details
        setProduct(response.data); // Set product data
        setMainImage(response.data.images[0]); // Set the first image as main
      } catch (err) {
        setError("Không thể tải sản phẩm."); // Set error message
        console.error("Error fetching product:", err); // Log error
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };
    fetchProduct();
  }, [id]);

  // Handle quantity increase
  const handleIncrease = () =>
    setQuantity((prev) => Math.min(prev + 1, product.stock));

  // Handle quantity decrease
  const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));

  // Handle adding product to cart
  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("accessToken"); // Get token
    const cartItem = { productId, quantity }; // Cart item details

    try {
      if (token) {
        await apiClient.post("/cart/add", cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        }); // Add to cart via API
        incrementCartCount(quantity); // Update cart count in context
        setToastMessage("Sản phẩm đã được thêm vào giỏ hàng!"); // Success message
      } else {
        setToastMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."); // Prompt login
      }
    } catch (error) {
      setToastMessage("Có lỗi xảy ra khi thêm vào giỏ hàng."); // Error message
      console.error("Error adding to cart:", error); // Log error
    } finally {
      setShowToast(true); // Show toast
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
    }
  };

  // Handle main image click
  const handleImageClick = (img) => setMainImage(img);

  const imagesPerSlide = 5; // Number of images per carousel slide

  // Handle next carousel slide
  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      Math.min(prev + 1, Math.ceil(product.images.length / imagesPerSlide) - 1)
    );
  };

  // Handle previous carousel slide
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  // Show attributes modal
  const handleShowAttributes = () => setShowModal(true);
  const handleCloseAttributes = () => setShowModal(false);

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (error)
    return (
      <div className="text-center text-danger my-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  // Slice images for the current carousel slide
  const displayedImages = product.images.slice(
    currentSlide * imagesPerSlide,
    currentSlide * imagesPerSlide + imagesPerSlide
  );

  return (
    <div className="single-product-page">
      <Container className="mt-5 container-single-product">
        {/* Breadcrumb Navigation */}
        <Row className="mb-4">
          <Col>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item custom-breadcrumb-item ">
                  <button
                    onClick={() => navigate("/product")}
                    className=" button-74"
                  >
                    <i className="fas fa-arrow-left"></i> Quay lại
                  </button>
                </li>
                <li
                  className="custom-breadcrumb-item active "
                  aria-current="page"
                >
                  Bạn đang xem sản phẩm: {product.name}
                </li>
              </ol>
            </nav>
          </Col>
        </Row>

        {/* Main Content Row with 3 Columns */}
        <Row>
          {/* Image Gallery */}
          <Col md={4} className="mb-4">
            <div className="image-gallery">
              {/* Main Image */}
              <div className="main-image mb-3">
                <Image
                  src={`${import.meta.env.VITE_API_BASE_URL.replace(
                    "/api",
                    ""
                  )}/products/${mainImage}`}
                  alt="Hình ảnh sản phẩm chính"
                  fluid
                  rounded
                  className="shadow main-image-fixed"
                />
              </div>

              {/* Small Images Carousel with Controls */}
              <div className="carousel-controls d-flex justify-content-center align-items-center">
                {/* Previous Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>

                {/* Small Images */}
                <div className="small-images-container d-flex mx-2">
                  {displayedImages.map((img, idx) => (
                    <Image
                      key={idx}
                      src={`${import.meta.env.VITE_API_BASE_URL.replace(
                        "/api",
                        ""
                      )}/products/${img}`}
                      alt={`Hình ảnh sản phẩm ${idx + 1}`}
                      fluid
                      rounded
                      onClick={() => handleImageClick(img)}
                      className={`small-image shadow me-2 ${
                        mainImage === img ? "selected" : ""
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleNextSlide}
                  disabled={
                    currentSlide >=
                    Math.ceil(product.images.length / imagesPerSlide) - 1
                  }
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          </Col>

          {/* Product Details */}
          <Col md={4} className="mb-4">
            <div className="product-details">
              <h2>{product.name}</h2>
              <h4 className="text-success">
                {product.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </h4>
              <p>
                Tồn kho:{" "}
                <Badge bg={product.stock > 0 ? "success" : "danger"}>
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </Badge>
                <span> số lượng: {product.stock}</span>
              </p>

              {/* Description */}
              <p>{product.description}</p>

              {/* Quantity Controls */}
              <InputGroup className="mb-3 quantity-controls">
                <button
                  className="button-minus"
                  variant="outline-secondary"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                >
                  -
                </button>

                <p className="text-quantity">
                  <strong>{quantity}</strong>
                </p>
                <button
                  className="button-plus"
                  variant="outline-secondary"
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </InputGroup>

              {/* Add to Cart & Attributes Buttons */}
              <div className="d-flex mb-3">
                <Button
                  variant={product.stock > 0 ? "primary" : "secondary"}
                  onClick={() => addToCart(product._id, quantity)}
                  disabled={product.stock === 0}
                  className="me-3 add-to-cart-btn"
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  variant="info"
                  onClick={handleShowAttributes}
                  className="attributes-btn"
                >
                  Chi tiết kỹ thuật
                </Button>
              </div>

              {/* Rating Component */}
              <div className="d-flex align-items-center">
                <RatingComponent productId={id} />
              </div>
            </div>
          </Col>

          {/* Comment Component */}
          <Col md={4} className="mb-4">
            <div className="comment-section">
              <CommentComponent productId={id} />
            </div>
          </Col>
        </Row>
      </Container>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Attributes Modal */}
      <Modal show={showModal} onHide={handleCloseAttributes} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết kỹ thuật</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group list-group-flush">
            {product.attributes.map((attr) => (
              <li key={attr._id} className="list-group-item">
                <strong>{attr.key}:</strong> {attr.value}
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAttributes}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SingleProductPage;
