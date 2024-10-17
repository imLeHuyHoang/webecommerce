import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./Skeleton/ProductSkeleton";
import "./ProductList.css";
import apiClient from "../../../src/utils/api-client";
import { NavLink } from "react-router-dom";

const ProductList = ({ selectedCategoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/products", {
          params: {
            category: selectedCategoryName || undefined,
            page: page,
            perPage: 8,
          },
        });
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedCategoryName]);

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setPage(pageNumber);
    }
  };

  return (
    <section className="product_list_section">
      <header className="align_center product_list_header">
        <NavLink to="/products" className="back_button">
          <i className="fa-solid fa-arrow-left back-to-products"></i>
          Back to Products
        </NavLink>
        <h2 className="product_list_heading">
          {selectedCategoryName || "Products"}
        </h2>
        <select name="sort" className="product_sorting">
          <option value="relevance">Relevance</option>
          <option value="high_to_low">Price HIGH to LOW</option>
          <option value="low_to_high">Price LOW to HIGH</option>
          <option value="rate_high_to_low">Rate HIGH to LOW</option>
          <option value="rate_low_to_high">Rate LOW to HIGH</option>
        </select>
      </header>
      <div className="product_list">
        {error && <em className="error">{error}</em>}
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard
              key={`${product._id}-${index}`}
              id={product._id}
              title={product.title}
              price={product.price}
              stock={product.stock}
              rating={product.reviews?.rate || 0}
              ratingCount={product.reviews?.counts || 0}
              image={product.images?.[0]}
            />
          ))
        ) : (
          <p>No products available.</p>
        )}
        {loading &&
          Array(8)
            .fill(0)
            .map((_, index) => <ProductSkeleton key={index} />)}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`pagination_button ${
                pageNumber === currentPage ? "active" : ""
              }`}
              onClick={() => handlePageClick(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
    </section>
  );
};

export default ProductList;
