import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../../utils/api-client";
import { useCart } from "../../../context/CartContext";
import ToastNotification from "../../ToastNotification/ToastNotification";
import "./SingleProductPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SingleProductPage = () => {
  const { id } = useParams();
  const { incrementCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/product/${id}`);
        setProduct(response.data);
        setMainImage(response.data.images[0]);
      } catch (err) {
        setError("Không thể tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrease = () =>
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("accessToken");
    const cartItem = { productId, quantity };

    try {
      if (token) {
        await apiClient.post("/cart/add", cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        incrementCartCount(quantity);
        setToastMessage("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        setToastMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      setToastMessage("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleImageClick = (img) => setMainImage(img);
  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      Math.min(prev + 1, Math.ceil(product.images.length / 5) - 1)
    );
  };
  const handlePrevSlide = () =>
    setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const handleShowAttributes = () => setShowAttributes(true);
  const handleCloseAttributes = () => setShowAttributes(false);

  if (loading) return <p className="text-center my-5">Đang tải...</p>;
  if (error) return <p className="text-center text-danger my-5">{error}</p>;

  const displayedImages = product.images.slice(
    currentSlide * 5,
    currentSlide * 5 + 5
  );

  return (
    <div className="main-page">
      <div className="container single-product-page">
        <ToastNotification
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
        <div className="row">
          <div className="col-md-12">
            <button
              className="btn btn-outline-secondary button-back"
              onClick={() => window.history.back()}
            >
              <i className="fas fa-arrow-left"></i> Quay lại sản phẩm
            </button>
          </div>
          <div className="col-md-7">
            <div className="image-container mb-4">
              <div className="main-image-container text-center mb-3">
                <img
                  id="mainImage"
                  src={`${import.meta.env.VITE_API_BASE_URL.replace(
                    "/api",
                    ""
                  )}/products/${mainImage}`}
                  alt="Hình ảnh sản phẩm chính"
                  className="img-fluid main-image"
                  width="600"
                  height="400"
                />
              </div>
              <div className="small-images-container d-flex align-items-center">
                <button
                  id="prevSlideBtn"
                  className="btn btn-outline-secondary btn-sm me-2 small-button"
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                >
                  &lt;
                </button>
                <div
                  id="smallImagesContainer"
                  className="small-images d-flex justify-content-center"
                >
                  {displayedImages.map((img, index) => (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL.replace(
                        "/api",
                        ""
                      )}/products/${img}`}
                      alt={`Hình ảnh sản phẩm ${index + 1}`}
                      className={`small-image img-thumbnail ${
                        mainImage === img ? "selected" : ""
                      }`}
                      width="80"
                      height="80"
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </div>
                <button
                  id="nextSlideBtn"
                  className="btn btn-outline-secondary btn-sm ms-2 small-button"
                  onClick={handleNextSlide}
                  disabled={
                    currentSlide >= Math.ceil(product.images.length / 5) - 1
                  }
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="product-details">
              <h2 id="productName">{product.name}</h2>
              <p>
                Giá:{" "}
                <strong id="productPrice">
                  {product.price.toLocaleString("vi-VN")} VND
                </strong>
              </p>
              <p>
                Tồn kho: <span id="productStock">{product.stock}</span>
              </p>
              <p>
                Đánh giá:{" "}
                <span id="productRating">{product.reviews?.rate || 0}</span> (
                <span id="productReviews">{product.reviews?.counts || 0}</span>{" "}
                đánh giá)
              </p>
              <div className="product-description">
                <p id="productDescription">{product.description}</p>
              </div>
              <div className="quantity-controls my-3">
                <button
                  id="decreaseQuantityBtn"
                  className="btn btn-outline-secondary button-decrease"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span id="quantity" className="mx-3 quantity">
                  {quantity}
                </span>
                <button
                  id="increaseQuantityBtn"
                  className="btn btn-outline-secondary button-increase"
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <div className="d-flex align-items-center two-button">
                <button
                  id="addToCartBtn"
                  className="btn btn-primary add-button"
                  onClick={() => addToCart(product._id, quantity)}
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  id="showAttributesBtn"
                  className="btn btn-info ms-3 attribute-button"
                  onClick={handleShowAttributes}
                  style={{ marginLeft: "20px" }}
                >
                  Chi tiết kỹ thuật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAttributes && (
        <div
          className="modal-overlay"
          id="attributesModal"
          onClick={handleCloseAttributes}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              id="closeAttributesBtn"
              onClick={handleCloseAttributes}
            >
              &times;
            </button>
            <h4>Chi tiết kỹ thuật</h4>
            <ul id="attributesList">
              {product.attributes.map((attr) => (
                <li key={attr._id}>
                  <strong>{attr.key}:</strong> {attr.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProductPage;
