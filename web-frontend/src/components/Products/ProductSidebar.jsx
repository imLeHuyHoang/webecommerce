import React, { useEffect, useState } from "react";
import "./ProductSidebar.css";
import apiClient from "../../utils/api-client";
import ProductSidebarSkeleton from "./Skeleton/ProductSidebarSkeleton";

function ProductSidebar({ onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/category")
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setCategories([]);
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryName) => {
    onCategoryChange(categoryName);
  };

  return (
    <div
      className="sidebar d-flex flex-column flex-shrink-0 p-3"
      style={{ width: "280px" }}
    >
      <a
        href="/"
        className=" d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none"
      >
        <svg className="bi me-2" width="40" height="32">
          <use xlinkHref="#bootstrap" />
        </svg>
        <span className="fs-4">Categories</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {error && <em className="text-danger">{error}</em>}
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => <ProductSidebarSkeleton key={index} />)
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <li key={cat._id} className="nav-item">
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className="nav-link "
              >
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL.replace(
                    "/api",
                    ""
                  )}/category/${cat.images[0]}`}
                  alt={cat.name}
                  className="me-2 rounded-circle"
                  width="20"
                  height="20"
                />
                {cat.name}
              </button>
            </li>
          ))
        ) : (
          <p className="">No categories available.</p>
        )}
      </ul>
      <hr />
    </div>
  );
}

export default ProductSidebar;
