import React from "react";
import "./ProductPage.css";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation, useNavigate } from "react-router-dom";

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const selectedCategoryName = searchParams.get("category");

  const handleCategoryChange = (category) => {
    searchParams.set("category", category); // Cập nhật query param
    navigate({ search: searchParams.toString() }); // Điều hướng tới URL mới
  };

  return (
    <section className="product_page">
      <ProductSidebar onCategoryChange={handleCategoryChange} />
      <ProductList selectedCategoryName={selectedCategoryName} />
    </section>
  );
};

export default ProductPage;
