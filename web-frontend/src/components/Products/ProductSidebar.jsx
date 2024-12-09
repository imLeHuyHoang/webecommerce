// src/components/ProductPage/ProductSidebar.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, ListGroup, Alert, InputGroup } from "react-bootstrap";
import "./ProductSidebar.css";
import apiClient from "../../utils/api-client";
import ProductSidebarSkeleton from "./Skeleton/ProductSidebarSkeleton";

function ProductSidebar({
  onCategoryChange,
  onFilterChange,
  filters,
  showFilters,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState(
    filters.category || ""
  );

  // State để quản lý việc hiển thị sidebar trên thiết bị di động
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

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
      // Deselect if the same category is clicked
      setSelectedCategory("");
      onCategoryChange("");
      onFilterChange("category", "");
    } else {
      setSelectedCategory(categoryName);
      onCategoryChange(categoryName);
      onFilterChange("category", categoryName);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange("search", searchTerm);
    setIsSidebarVisible(false);
  };

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    onFilterChange("brand", brand);
    setIsSidebarVisible(false);
  };

  const handleCloseSidebar = () => {
    setIsSidebarVisible(false);
  };

  return (
    <>
      {/* Nút Bộ lọc chỉ hiển thị trên thiết bị di động */}
      <Button
        className="product-sidebar-filter-toggle-button d-md-none"
        onClick={() => setIsSidebarVisible(true)}
      >
        Bộ lọc
      </Button>

      {/* Overlay khi sidebar mở trên thiết bị di động */}
      <div
        className={`product-sidebar-overlay ${
          isSidebarVisible ? "active" : ""
        }`}
        onClick={handleCloseSidebar}
      ></div>

      <div
        className={`product-sidebar-container ${showFilters ? "show" : ""} ${
          isSidebarVisible ? "show" : ""
        }`}
      >
        {/* Categories */}
        <h4 className="product-sidebar-title">Danh mục</h4>
        {error && (
          <Alert variant="danger" className="product-sidebar-error-alert">
            {error}
          </Alert>
        )}
        {loading ? (
          <ListGroup className="product-sidebar-category-list">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <ProductSidebarSkeleton key={index} />
              ))}
          </ListGroup>
        ) : (
          <ListGroup className="product-sidebar-category-list">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <ListGroup.Item
                  key={cat._id}
                  action
                  active={selectedCategory === cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="product-sidebar-category-item d-flex align-items-center"
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/category/${cat.images[0]}`}
                    alt={cat.name}
                    className="product-sidebar-category-image me-2"
                    width="20"
                    height="20"
                  />
                  {cat.name}
                </ListGroup.Item>
              ))
            ) : (
              <p className="product-sidebar-no-category">
                Không có danh mục nào.
              </p>
            )}
          </ListGroup>
        )}

        {/* Selected Category */}
        {selectedCategory && (
          <p className="product-sidebar-selected-category mt-3">
            Bạn đang ở danh mục: <strong>{selectedCategory}</strong>
          </p>
        )}

        {/* Filters */}
        <div className="product-sidebar-filters mt-4">
          <h4 className="product-sidebar-title">Bộ lọc</h4>

          {/* Search Filter */}
          <Form
            onSubmit={handleSearchSubmit}
            className="mb-3 product-sidebar-form"
          >
            <Form.Group controlId="search">
              <Form.Label className="product-sidebar-label">
                Tìm kiếm
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="product-sidebar-input"
                />
                <Button
                  variant="outline-secondary"
                  type="submit"
                  className="product-sidebar-button"
                >
                  Tìm
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>

          {/* Brand Filter */}
          <Form
            onSubmit={handleBrandSubmit}
            className="mb-3 product-sidebar-form"
          >
            <Form.Group controlId="brand">
              <Form.Label className="product-sidebar-label">
                Thương hiệu
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập thương hiệu..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="product-sidebar-input"
                />
                <Button
                  variant="outline-secondary"
                  type="submit"
                  className="product-sidebar-button"
                >
                  Áp dụng
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>

          {/* Price Range Filter */}
          <Form.Group
            controlId="price"
            className="mb-3 product-sidebar-form-group"
          >
            <Form.Label className="product-sidebar-label">
              Khoảng giá
            </Form.Label>
            <Form.Select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                onFilterChange("price", e.target.value);
                setIsSidebarVisible(false);
              }}
              className="product-sidebar-select"
            >
              <option value="">Tất cả</option>
              <option value="0-5000000">Dưới 5 triệu</option>
              <option value="5000000-10000000">5 - 10 triệu</option>
              <option value="10000000-20000000">10 - 20 triệu</option>
              <option value="20000000-">Trên 20 triệu</option>
            </Form.Select>
          </Form.Group>

          {/* Rating Filter */}
          <Form.Group
            controlId="rating"
            className="mb-3 product-sidebar-form-group"
          >
            <Form.Label className="product-sidebar-label">Đánh giá</Form.Label>
            <Form.Select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                onFilterChange("rating", e.target.value);
                setIsSidebarVisible(false);
              }}
              className="product-sidebar-select"
            >
              <option value="">Tất cả</option>
              <option value="4">4 sao trở lên</option>
              <option value="3">3 sao trở lên</option>
              <option value="2">2 sao trở lên</option>
              <option value="1">1 sao trở lên</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>
    </>
  );
}

export default ProductSidebar;
