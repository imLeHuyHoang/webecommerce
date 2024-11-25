// ProductPage.jsx
import React, { useState, useEffect } from "react";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductPage.css";

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({});

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

  const handleCategoryChange = (category) => {
    updateFilters("category", category);
  };

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
