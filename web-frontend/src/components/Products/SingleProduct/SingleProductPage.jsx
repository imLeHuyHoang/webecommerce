import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api-client";
import { useCart } from "../../../context/CartContext";
import ToastNotification from "../../ToastNotification/ToastNotification";
import "./SingleProductPage.css";

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incrementCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(""); // Thêm state cho ảnh chính
  const [selectedImage, setSelectedImage] = useState(null); // State cho việc chọn ảnh con
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/product/${id}`);
        setProduct(response.data);
        setMainImage(response.data.images[0]); // Đặt ảnh chính ban đầu
      } catch (err) {
        setError("Không thể tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("accessToken");
    const cartItem = { productId, quantity };

    try {
      if (token) {
        await apiClient.post("/cart", cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        incrementCartCount(quantity);
        setToastMessage("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        setToastMessage("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setToastMessage("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBuyNow = () => {
    if (product) addToCart(product._id, quantity);
  };

  const handleImageClick = (img) => {
    setMainImage(img); // Cập nhật ảnh chính khi bấm vào ảnh nhỏ
    setSelectedImage(img === selectedImage ? null : img); // Đổi trạng thái khi click vào ảnh nhỏ
  };

  if (loading) return <p className="text-center my-5">Loading...</p>;
  if (error) return <p className="text-center text-danger my-5">{error}</p>;

  const mainImageUrl = mainImage
    ? `${import.meta.env.VITE_API_BASE_URL.replace(
        "/api",
        ""
      )}/products/${mainImage}`
    : "/images/default-image.png";

  return (
    <div className="main-page">
      <div className="container single-product-page">
        <ToastNotification
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
        <div className="row">
          <div className="col-md-6">
            <div className="image-container mb-4">
              <div className="small-images d-flex justify-content-center">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.VITE_API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/products/${img}`}
                    alt={`Product ${index}`}
                    className={`small-image img-thumbnail ${
                      selectedImage === img ? "selected" : ""
                    }`}
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
              <div className="main-image-container">
                <img
                  src={mainImageUrl}
                  alt={product.title}
                  className="img-fluid main-image"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="product-details">
              <h2>{product.title}</h2>
              <p>
                Price: <strong>${product.price.toFixed(2)}</strong>
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
                  className="btn btn-outline-secondary justify-content-center"
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
              <div className="d-flex justify-content-center ">
                <button
                  className="btn btn-primary btn-block mt-4"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
