// ProductPage.jsx
import React, { useState, useEffect } from "react";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductPage.css";

/**
 * Component ProductPage
 *
 * Đây là component chính của trang sản phẩm, bao gồm sidebar để lọc sản phẩm và danh sách sản phẩm.
 */
const ProductPage = () => {
  // Lấy thông tin về URL hiện tại
  const location = useLocation();
  // Sử dụng để điều hướng
  const navigate = useNavigate();

  // State để lưu trữ các bộ lọc
  const [filters, setFilters] = useState({});

  // useEffect để cập nhật state filters khi URL thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setFilters({
      category: searchParams.get("category") || "",
      search: searchParams.get("search") || "",
      brand: searchParams.get("brand") || "",
      price: searchParams.get("price") || "",
      rating: searchParams.get("rating") || "",
    });
  }, [location.search]);

  /**
   * Hàm updateFilters
   *
   * Hàm này được sử dụng để cập nhật các bộ lọc và URL.
   *
   * @param {string} filterKey - Tên của bộ lọc (category, search, brand, price, rating)
   * @param {string} filterValue - Giá trị của bộ lọc
   */
  const updateFilters = (filterKey, filterValue) => {
    const newFilters = { ...filters, [filterKey]: filterValue };

    // Cập nhật URL
    const searchParams = new URLSearchParams(location.search);
    if (filterValue) {
      searchParams.set(filterKey, filterValue);
    } else {
      searchParams.delete(filterKey);
    }
    navigate({ search: searchParams.toString() });
  };

  /**
   * Hàm handleCategoryChange
   *
   * Hàm này được sử dụng để cập nhật bộ lọc category.
   *
   * @param {string} category - Tên của danh mục
   */
  const handleCategoryChange = (category) => {
    updateFilters("category", category);
  };

  // Render giao diện của component
  return (
    <div className="product-page">
      <ProductSidebar
        onCategoryChange={handleCategoryChange}
        onFilterChange={updateFilters}
        filters={filters}
      />
      <ProductList filters={filters} />
    </div>
  );
};

export default ProductPage;
