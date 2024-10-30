// ProductPage.js
import React from "react";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation, useNavigate } from "react-router-dom";

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const selectedCategoryName = searchParams.get("category");

  const handleCategoryChange = (category) => {
    searchParams.set("category", category);
    navigate({ search: searchParams.toString() });
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <ProductSidebar onCategoryChange={handleCategoryChange} />
        <ProductList selectedCategoryName={selectedCategoryName} />
      </div>
    </div>
  );
};

export default ProductPage;
