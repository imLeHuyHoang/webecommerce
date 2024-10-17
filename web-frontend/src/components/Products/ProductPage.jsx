import React from "react";
import "./ProductPage.css";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation } from "react-router-dom";

const ProductPage = () => {
  const location = useLocation();

  // Lấy category từ URL query nếu có
  const queryParams = new URLSearchParams(location.search);
  const selectedCategoryName = queryParams.get("category") || null; // Lấy 'category' từ URL

  return (
    <section className="product_page">
      {/* Sidebar */}
      <ProductSidebar />

      {/* Danh sách sản phẩm */}
      <ProductList selectedCategoryName={selectedCategoryName} />
    </section>
  );
};

export default ProductPage;
