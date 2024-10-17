import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../../utils/api-client";
import "./SingleProductPage.css";

const SingleProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center my-5">Loading...</p>;
  if (error)
    return <p className="text-center text-danger my-5">Error: {error}</p>;

  const images = product?.images?.slice(0, 4) || [];
  const mainImage =
    product?.images && product.images.length > 0
      ? `http://localhost:5000/products/${product.images[0]}`
      : "default-image.png";
  console.log(product);
  return product ? (
    <div className="single-product">
      <div className="image-container">
        <div className="small-images">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={`http://localhost:5000/products/${img}`}
              alt={`Product ${index}`}
              className="small-image"
            />
          ))}
        </div>
        <div className="main-image-container">
          <img src={mainImage} alt={product.title} className="main-image" />
        </div>
      </div>
      <div className="product-details">
        <h2>{product.title}</h2>
        <p>Price: ${product.price}</p>
        <p>Stock: {product.stock}</p>
        <p>
          Rating: {product.reviews?.rate || 0} ({product.reviews?.counts || 0}{" "}
          reviews)
        </p>
        <div className="product-description">
          <p>{product.description}</p>
        </div>
        <button className="Buynow"> Buy Now</button>
      </div>
    </div>
  ) : (
    <p className="text-center">Product not found</p>
  );
};

export default SingleProductPage;
