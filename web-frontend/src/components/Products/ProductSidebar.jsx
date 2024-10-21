import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./ProductSidebar.css"; // Giữ nguyên CSS tùy chỉnh
import apiClient from "../../../src/utils/api-client";
import ProductSidebarSkeleton from "./Skeleton/ProductSidebarSkeleton";

function ProductSidebar({ onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/category")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryName) => {
    onCategoryChange(categoryName); // Gọi hàm callback để cập nhật URL
  };

  return (
    <aside className="product_sidebar col-md-4 col-lg-3">
      <h2 className="category">Category</h2>
      <div className="category_links">
        {error && <em className="error">{error}</em>}
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => <ProductSidebarSkeleton key={index} />)
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.name)}
              className="align_center sidebar_link"
            >
              {cat.name}
              <img
                src={`http://localhost:5000/category/${cat.image}`}
                alt={cat.name}
                className="link_emoji"
              />
            </button>
          ))
        ) : (
          <p>No categories available.</p>
        )}
      </div>
    </aside>
  );
}

export default ProductSidebar;
