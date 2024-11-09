// ProductSidebar.js
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
        console.log("API Response:", res.data); // Kiểm tra dữ liệu trả về
        setCategories(Array.isArray(res.data) ? res.data : []); // Đảm bảo categories là mảng
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setCategories([]); // Gán giá trị mặc định nếu có lỗi
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryName) => {
    onCategoryChange(categoryName);
  };

  return (
    <div className="col-md-4 col-lg-3 mb-4">
      <h2 className="category mb-4">Category</h2>
      <div className="list-group">
        {error && <em className="text-danger">{error}</em>}
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => <ProductSidebarSkeleton key={index} />)
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.name)}
              className="list-group-item list-group-item-action sidebar_link mb-2"
            >
              <span>{cat.name}</span>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/category/${cat.image}`}
                alt={cat.name}
                className="link_emoji"
              />
            </button>
          ))
        ) : (
          <p>No categories available.</p>
        )}
      </div>
    </div>
  );
}

export default ProductSidebar;
