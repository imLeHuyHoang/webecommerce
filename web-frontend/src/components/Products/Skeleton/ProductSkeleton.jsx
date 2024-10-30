// ProductSkeleton.js
import React from "react";
import "./ProductSkeleton.css";

const ProductSkeleton = () => {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-image card-img-top"></div>
      <div className="card-body">
        <div className="skeleton-title mb-2"></div>
        <div className="skeleton-price"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
