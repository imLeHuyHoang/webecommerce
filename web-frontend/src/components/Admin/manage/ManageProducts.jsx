// src/pages/ManageProducts/ManageProducts.jsx

import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api-client";
import ProductForm from "../form/ProductForm";
import ToastNotification from "../../ToastNotification/ToastNotification";
import { getProductImageUrl } from "../../../utils/image-helper"; // Helper lấy đường dẫn ảnh
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    code: "",
    name: "",
    brand: "",
    price: "",
    category: "",
    attributes: "",
  });

  // Lấy danh sách sản phẩm
  useEffect(() => {
    fetchProducts();
  }, []);

  // Áp dụng bộ lọc khi products hoặc filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setToast({
        show: true,
        message: "Không thể tải sản phẩm",
        variant: "danger",
      });
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?"))
      return;
    try {
      await apiClient.delete(`/product/${productId}`);
      setToast({
        show: true,
        message: "Xóa sản phẩm thành công",
        variant: "success",
      });
      fetchProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      setToast({
        show: true,
        message: "Không thể xóa sản phẩm",
        variant: "danger",
      });
    }
  };

  const handleSaveProduct = () => {
    setShowModal(false);
    fetchProducts();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    let filtered = products.filter((product) => {
      const matchesCode = product.code
        .toLowerCase()
        .includes(filters.code.toLowerCase());
      const matchesName = product.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesBrand = product.brand
        ? product.brand.toLowerCase().includes(filters.brand.toLowerCase())
        : false;
      const matchesPrice = filters.price
        ? product.price === parseFloat(filters.price)
        : true;
      const matchesCategory = product.category
        ? product.category.name
            .toLowerCase()
            .includes(filters.category.toLowerCase())
        : false;
      const matchesAttributes = product.attributes.some((attr) =>
        `${attr.key}: ${attr.value}`
          .toLowerCase()
          .includes(filters.attributes.toLowerCase())
      );

      return (
        matchesCode &&
        matchesName &&
        matchesBrand &&
        matchesPrice &&
        matchesCategory &&
        matchesAttributes
      );
    });
    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      code: "",
      name: "",
      brand: "",
      price: "",
      category: "",
      attributes: "",
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      <div className="manage-product-container mt-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Quản lý sản phẩm</h1>
          <div>
            <button
              className="btn btn-secondary me-2 manage-product-btn-filter"
              onClick={toggleFilters}
            >
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </button>
            <button
              className="btn btn-primary manage-product-btn-add-product"
              onClick={handleAddProduct}
            >
              Thêm sản phẩm mới
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="mb-4 manage-product-filter-container">
            <form className="row manage-product-filter-form">
              <div className="col-md-2 manage-product-one-div-filter">
                <label className="form-label" htmlFor="filterCode">
                  Mã
                </label>
                <input
                  className="form-control manage-product-form-code"
                  id="filterCode"
                  type="text"
                  name="code"
                  value={filters.code}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 manage-product-one-div-filter">
                <label className="form-label" htmlFor="filterName">
                  Tên
                </label>
                <input
                  className="form-control manage-product-form-name"
                  id="filterName"
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 manage-product-one-div-filter">
                <label
                  className="form-label manage-product-form-trademark-filter"
                  htmlFor="filterBrand"
                >
                  Thương hiệu
                </label>
                <input
                  className="form-control manage-product-form-trademark"
                  id="filterBrand"
                  type="text"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 manage-product-one-div-filter">
                <label className="form-label" htmlFor="filterPrice">
                  Giá
                </label>
                <input
                  className="form-control manage-product-form-price"
                  id="filterPrice"
                  type="number"
                  name="price"
                  value={filters.price}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 manage-product-one-div-filter">
                <label className="form-label" htmlFor="filterCategory">
                  Danh mục
                </label>
                <input
                  className="form-control manage-product-form-category"
                  id="filterCategory"
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 d-flex manage-product-filter-buttons">
                <button
                  className="btn btn-secondary me-2 manage-product-btn-clear"
                  type="button"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </button>
                <button
                  className="btn btn-primary manage-product-btn-apply"
                  type="button"
                  onClick={applyFilters}
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Table Section */}
        <div className="table-responsive manage-product-table-responsive">
          <table className="table table-bordered manage-product-table">
            <thead className="table-dark">
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Thuộc tính</th>
                <th>Hình ảnh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{product.brand || "N/A"}</td>
                    <td>
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td>{product.category?.name || "N/A"}</td>
                    <td>
                      {product.attributes.map((attr, index) => (
                        <div key={index}>
                          {attr.key}: {attr.value}
                        </div>
                      ))}
                    </td>
                    <td>
                      {product.images.map((img, index) => (
                        <img
                          key={index}
                          src={getProductImageUrl(img)}
                          alt={product.name}
                          className="img-thumbnail manage-product-img-thumbnail"
                          style={{ width: "50px", marginRight: "5px" }}
                        />
                      ))}
                    </td>
                    <td className="manage-product-action-buttons">
                      <button
                        className="btn btn-edit manage-product-btn-edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-delete manage-product-btn-delete"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Product */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ProductForm
                  product={selectedProduct}
                  onSuccess={handleSaveProduct}
                  onCancel={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <ToastNotification
          show={toast.show}
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
};

export default ManageProducts;
