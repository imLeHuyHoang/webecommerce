import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./Skeleton/ProductSkeleton";
import apiClient from "../../utils/api-client";
import { NavLink } from "react-router-dom";
import "./ProductList.css"; // Import CSS

const ProductList = ({ selectedCategoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/product", {
          params: {
            category: selectedCategoryName || undefined,
            page: page,
            perPage: 9,
          },
        });
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedCategoryName]);

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  return (
    <div className="col-md-8 col-lg-9">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="product_list_heading">
          {selectedCategoryName || "Products"}
        </h2>
        <NavLink to="/product" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Back to Products
        </NavLink>
      </header>

      <div className="row">
        {error && <em className="text-danger">{error}</em>}
        {products.length > 0
          ? products.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="col-md-6 col-lg-4 mb-4"
              >
                <ProductCard
                  id={product._id}
                  title={product.title}
                  price={product.price}
                  stock={product.stock}
                  rating={product.reviews?.rate || 0}
                  ratingCount={product.reviews?.counts || 0}
                  image={product.images?.[0]}
                />
              </div>
            ))
          : !loading && <p>No products available.</p>}
        {loading &&
          Array(9)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="col-md-6 col-lg-4 mb-4">
                <ProductSkeleton />
              </div>
            ))}
      </div>

      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <li
                key={pageNumber}
                className={`page-item ${pageNumber === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageClick(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            )
          )}
        </ul>
      </nav>
    </div>
  );
};

export default ProductList;
