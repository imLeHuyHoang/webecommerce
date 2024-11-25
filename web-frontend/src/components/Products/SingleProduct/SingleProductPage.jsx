import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../../utils/api-client";
import { useCart } from "../../../context/CartContext";
import ToastNotification from "../../ToastNotification/ToastNotification";
import "./SingleProductPage.css";

const SingleProductPage = () => {
  const { id } = useParams();
  const { incrementCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0); // Track the current slide index
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false); // State to show/hide attributes modal

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/product/${id}`);
        setProduct(response.data);
        setMainImage(response.data.images[0]);
      } catch (err) {
        setError("Unable to load the product.");
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
        await apiClient.post("/cart", cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        incrementCartCount(quantity);
        setToastMessage("Product added to cart!");
      } else {
        setToastMessage("Please login to add items to cart.");
      }
    } catch (error) {
      setToastMessage("An error occurred while adding to cart.");
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

  if (loading) return <p className="text-center my-5">Loading...</p>;
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
              Back to Products
            </button>
          </div>

          <div className="col-md-7">
            <div className="image-container mb-4">
              <div className="main-image-container text-center mb-3">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL.replace(
                    "/api",
                    ""
                  )}/products/${mainImage}`}
                  alt={product.title}
                  className="img-fluid main-image"
                />
              </div>
              <div className="small-images-container d-flex align-items-center">
                {currentSlide > 0 && (
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={handlePrevSlide}
                  >
                    &lt;
                  </button>
                )}
                <div className="small-images d-flex justify-content-center">
                  {displayedImages.map((img, index) => (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL.replace(
                        "/api",
                        ""
                      )}/products/${img}`}
                      alt={`Product ${index}`}
                      className={`small-image img-thumbnail ${
                        mainImage === img ? "selected" : ""
                      }`}
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </div>
                {currentSlide < Math.ceil(product.images.length / 5) - 1 && (
                  <button
                    className="btn btn-outline-secondary btn-sm ms-2 "
                    onClick={handleNextSlide}
                  >
                    &gt;
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="product-details">
              <h2>{product.name}</h2>
              <p>
                Price: <strong>${product.price}</strong>
              </p>
              <p>Stock: {product.stock}</p>
              <p>
                Rating: {product.reviews?.rate || 0} (
                {product.reviews?.counts || 0} reviews)
              </p>
              <div className="product-description">
                <p>{product.description}</p>
              </div>

              <div className="quantity-controls my-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="mx-3 quantity">{quantity}</span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => addToCart(product._id, quantity)}
              >
                Add to Cart
              </button>
              <br />
              <button className="btn btn-info" onClick={handleShowAttributes}>
                Technical Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAttributes && (
        <div className="modal-overlay" onClick={handleCloseAttributes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseAttributes}>
              &times;
            </button>
            <h4>Technical Details</h4>
            <ul>
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
