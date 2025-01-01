// src/pages/SingleProductPage/SingleProductPage.js
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
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api-client"; // <-- kiểm tra file này coi có interceptor không
import { useCart } from "../../../context/CartContext";
import ToastNotification from "../../ToastNotification/ToastNotification";
import RatingComponent from "../../RatingandComment/RatingComponent";
import CommentComponent from "../../RatingandComment/CommentComponent";
import CompareModal from "./CompareModel";
import AdditionalContent from "../../AdditionalContent/AddtionalContent";
import { getProductImageUrl } from "../../../utils/image-helper";
import "./SingleProductPage.css";

const SingleProductPage = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate(); // Dùng để chuyển trang
  const { incrementCartCount } = useCart(); // Context giỏ hàng

  // State quản lý dữ liệu & hiển thị
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/product/${id}`);
        setProduct(response.data);
        setMainImage(response.data.images[0]);
      } catch (err) {
        setError("Không thể tải sản phẩm.");
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Tăng/giảm số lượng
  const handleIncrease = () =>
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));

  // Hàm thêm vào giỏ hàng
  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("accessToken");
    const cartItem = { productId, quantity };

    try {
      if (token) {
        // Gửi request thêm vào giỏ
        await apiClient.post("/cart/add", cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Nếu không lỗi => cập nhật context, báo thành công
        incrementCartCount(quantity);
        setToastMessage("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        setToastMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      // Nếu request bị ném lỗi => thông báo thất bại
      setToastMessage("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.");
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    } finally {
      // Dù thành công hay thất bại thì cũng show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Xử lý thay đổi hình ảnh chính khi click hình nhỏ
  const handleImageClick = (img) => setMainImage(img);

  // Chuyển slide carousel
  const imagesPerSlide = 5;
  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      Math.min(prev + 1, Math.ceil(product.images.length / imagesPerSlide) - 1)
    );
  };
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  // Mở/đóng modal
  const handleShowAttributes = () => setShowModal(true);
  const handleCloseAttributes = () => setShowModal(false);

  const handleShowCompareModal = () => setShowCompareModal(true);
  const handleCloseCompareModal = () => setShowCompareModal(false);

  // Loading hay có lỗi => hiển thị tương ứng
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

  // Cắt mảng hình ảnh theo slide
  const displayedImages = product.images.slice(
    currentSlide * imagesPerSlide,
    currentSlide * imagesPerSlide + imagesPerSlide
  );

  // Xây dựng URL
  const mainImageUrl = getProductImageUrl(mainImage);
  const smallImageUrls = displayedImages.map((img) => getProductImageUrl(img));

  return (
    <div className="single-product-page">
      <Container className="container-single-product">
        {/* Thanh breadcrumb */}
        <Row className="mb-4">
          <Col>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item custom-breadcrumb-item">
                  <button
                    onClick={() => navigate("/product")}
                    className="back-button"
                  >
                    <i className="fas fa-arrow-left"></i> Quay lại
                  </button>
                </li>
                <li
                  className="custom-breadcrumb-item active"
                  aria-current="page"
                >
                  Bạn đang xem sản phẩm: {product.name}
                </li>
              </ol>
            </nav>
          </Col>
        </Row>

        {/* 3 cột: (1) ảnh, (2) chi tiết, (3) comment */}
        <Row>
          {/* Cột ảnh */}
          <Col md={4} className="mb-4">
            <div className="image-gallery">
              <div className="main-image mb-3">
                <Image
                  src={mainImageUrl}
                  alt="Hình ảnh sản phẩm chính"
                  fluid
                  rounded
                  className="shadow main-image-fixed"
                />
              </div>

              {/* Carousel ảnh nhỏ */}
              <div className="carousel-controls d-flex justify-content-center align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>

                <div className="small-images-container d-flex mx-2">
                  {smallImageUrls.map((imgUrl, idx) => (
                    <Image
                      key={idx}
                      src={imgUrl}
                      alt={`Hình ảnh sản phẩm ${idx + 1}`}
                      fluid
                      rounded
                      onClick={() => handleImageClick(displayedImages[idx])}
                      className={`small-image shadow me-2 ${
                        mainImage === displayedImages[idx] ? "selected" : ""
                      }`}
                    />
                  ))}
                </div>

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

              {/* Nội dung bổ sung */}
              <AdditionalContent />
            </div>
          </Col>

          {/* Cột chi tiết */}
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
                <span> (số lượng: {product.stock})</span>
              </p>
              <p>{product.description}</p>

              {/* Nút tăng/giảm + So sánh */}
              <div className="quantity-controls">
                <button
                  className="btn-decrease"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <p className="text-quantity">{quantity}</p>
                <button
                  className="btn-increase"
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>

                <button
                  className="button compare-btn"
                  onClick={handleShowCompareModal}
                >
                  So Sánh
                </button>
              </div>

              {/* Nút Thêm vào giỏ + Chi tiết kỹ thuật */}
              <div className="d-flex mb-3 add-and-attributes">
                {/* 
                  Option 1: Sử dụng variant, 
                  nhưng nếu bị override .btn-primary, 
                  bạn cần !important CSS hoặc selector cụ thể 
                */}
                <Button
                  variant={product.stock > 0 ? "primary" : "secondary"}
                  onClick={() => addToCart(product._id, quantity)}
                  disabled={product.stock === 0}
                  className="me-3 add-to-cart-btn"
                >
                  Thêm vào giỏ hàng
                </Button>

                {/* Nút mở modal Thông số kỹ thuật */}
                <Button
                  variant="info"
                  onClick={handleShowAttributes}
                  className="attributes-btn"
                >
                  Chi tiết kỹ thuật
                </Button>
              </div>

              {/* Rating */}
              <div className="d-flex align-items-center">
                <RatingComponent productId={id} />
              </div>
            </div>
          </Col>

          {/* Cột comment */}
          <Col md={4} className="mb-4">
            <div className="comment-section">
              <CommentComponent productId={id} />
            </div>
          </Col>
        </Row>
      </Container>

      {/* Thông báo dạng Toast */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Modal thuộc tính */}
      <Modal show={showModal} onHide={handleCloseAttributes} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết kỹ thuật</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group list-group-flush">
            {product.attributes.map((attr) => (
              <li key={attr.key} className="list-group-item">
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

      {/* Modal so sánh */}
      <CompareModal
        show={showCompareModal}
        handleClose={handleCloseCompareModal}
        currentProduct={product}
      />
    </div>
  );
};

export default SingleProductPage;
