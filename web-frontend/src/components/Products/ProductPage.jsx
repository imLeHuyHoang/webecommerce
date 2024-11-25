import React from "react";
import ProductSidebar from "./ProductSidebar";
import ProductList from "./ProductList";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductPage = () => {
  // Lấy thông tin về URL hiện tại
  const location = useLocation();
  // Sử dụng để điều hướng
  const navigate = useNavigate();

  // Lấy tham số category từ URL
  const searchParams = new URLSearchParams(location.search);
  const selectedCategoryName = searchParams.get("category");

  // Hàm thay đổi danh mục sản phẩm
  const handleCategoryChange = (category) => {
    // Cập nhật giá trị của tham số category trong URL
    searchParams.set("category", category);
    // Điều hướng đến URL mới với tham số category đã được cập nhật

    navigate({ search: searchParams.toString() });
  };

  // Render giao diện của component
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3">
          {/* Truyền hàm handleCategoryChange vào ProductSidebar */}
          <ProductSidebar onCategoryChange={handleCategoryChange} />
        </div>
        <div className="col-md-9">
          {/* Truyền giá trị danh mục được chọn vào ProductList */}
          <ProductList selectedCategoryName={selectedCategoryName} />
        </div>
      </div>
    </div>
  );
};

// Xuất component ProductPage
export default ProductPage;
