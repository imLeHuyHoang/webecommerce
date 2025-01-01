// src/components/ProductPage/ProductList.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import ProductCard from "./ProductCard";
import apiClient from "../../utils/api-client";
import "./ProductList.css";

function ProductList({ filters }) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/product", {
          params: {
            // gửi các tham số tìm kiếm lên server
            search: filters.search || "",
            brand: filters.brand || "",
            category: filters.category || "",
            rating: filters.rating || "",
          },
        });

        setAllProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Có lỗi xảy ra khi tải sản phẩm.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.search, filters.brand, filters.category, filters.rating]);

  useEffect(() => {
    let tempProducts = [...allProducts];

    // Lọc sản phẩm theo giá
    if (filters.price) {
      const [min, max] = filters.price.split("-");
      const minPrice = min ? parseInt(min, 10) : 0;
      const maxPrice = max ? parseInt(max, 10) : Infinity;
      tempProducts = tempProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    }

    setFilteredProducts(tempProducts);
    setCurrentPage(1);
  }, [allProducts, filters.price]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="product-list-loading text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="product-list-error-container my-5">
        <Alert variant="danger" className="product-list-error-alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <section className="product-list-section">
      <Container className="product-list-container">
        {currentProducts.length > 0 ? (
          <>
            <Row className="product-list-row">
              {currentProducts.map((product) => (
                <Col
                  key={product._id}
                  md={4}
                  lg={3}
                  className="product-list-col mb-4"
                >
                  <ProductCard
                    id={product._id}
                    title={product.name}
                    price={product.price}
                    stock={product.stock}
                    rating={product.averageRating}
                    reviewCount={product.reviewCount}
                    image={product.images?.[0]}
                  />
                </Col>
              ))}
            </Row>

            {totalPages > 1 && (
              <div className="product-list-pagination d-flex justify-content-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <p className="product-list-empty text-center">
            Không có sản phẩm nào.
          </p>
        )}
      </Container>
    </section>
  );
}

export default ProductList;
