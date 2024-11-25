// ProductSidebar.jsx
import React, { useEffect, useState } from "react";
import "./ProductSidebar.css";
import apiClient from "../../utils/api-client";
import ProductSidebarSkeleton from "./Skeleton/ProductSidebarSkeleton";

function ProductSidebar({ onCategoryChange, onFilterChange, filters }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");

  // State cho danh mục được chọn
  const [selectedCategory, setSelectedCategory] = useState(
    filters.category || ""
  );

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

  useEffect(() => {
    setSearchTerm(filters.search || "");
    setBrand(filters.brand || "");
    setPriceRange(filters.price || "");
    setRating(filters.rating || "");
    setSelectedCategory(filters.category || "");
  }, [filters]);

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      // Bỏ chọn nếu nhấn lại cùng một danh mục
      setSelectedCategory("");
      onCategoryChange("");
      onFilterChange("category", "");
    } else {
      setSelectedCategory(categoryName);
      onCategoryChange(categoryName);
      onFilterChange("category", categoryName);
    }
  };

  return (
    <div className="product-sidebar">
      <h4 className="sidebar-title">Danh mục</h4>
      <ul className="category-list">
        {error && <em className="text-danger">{error}</em>}
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => <ProductSidebarSkeleton key={index} />)
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <li
              key={cat._id}
              className={`category-item ${
                selectedCategory === cat.name ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/category/${cat.images[0]}`}
                alt={cat.name}
                className="category-image"
              />
              {cat.name}
            </li>
          ))
        ) : (
          <p>Không có danh mục nào.</p>
        )}
      </ul>

      <div className="filters">
        <h4 className="sidebar-title">Bộ lọc</h4>

        {/* Tìm kiếm */}
        <div className="filter-group">
          <label htmlFor="search">Tìm kiếm</label>
          <input
            type="text"
            id="search"
            placeholder="Nhập từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => onFilterChange("search", searchTerm)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onFilterChange("search", searchTerm);
              }
            }}
          />
        </div>

        {/* Thương hiệu */}
        <div className="filter-group">
          <label htmlFor="brand">Thương hiệu</label>
          <input
            type="text"
            id="brand"
            placeholder="Nhập thương hiệu..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            onBlur={() => onFilterChange("brand", brand)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onFilterChange("brand", brand);
              }
            }}
          />
        </div>

        {/* Khoảng giá */}
        <div className="filter-group">
          <label htmlFor="price">Khoảng giá</label>
          <select
            id="price"
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              onFilterChange("price", e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            <option value="0-5000000">Dưới 5 triệu</option>
            <option value="5000000-10000000">5 - 10 triệu</option>
            <option value="10000000-20000000">10 - 20 triệu</option>
            <option value="20000000-">Trên 20 triệu</option>
          </select>
        </div>

        {/* Đánh giá */}
        <div className="filter-group">
          <label htmlFor="rating">Đánh giá</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              onFilterChange("rating", e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            <option value="4">4 sao trở lên</option>
            <option value="3">3 sao trở lên</option>
            <option value="2">2 sao trở lên</option>
            <option value="1">1 sao trở lên</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductSidebar;
