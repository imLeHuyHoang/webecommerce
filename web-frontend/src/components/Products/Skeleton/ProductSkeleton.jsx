import React from "react";
import "./ProductSkeleton.css"; // Thêm CSS cho Skeleton

const ProductSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-price"></div>
    </div>
  );
};

export default ProductSkeleton;
