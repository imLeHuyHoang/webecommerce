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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/product", {
          params: filters,
        });
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setError("Có lỗi xảy ra khi tải sản phẩm.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  console.log(currentProducts);

  return (
    <section className="product-list my-5">
      <Container>
        {currentProducts.length > 0 ? (
          <>
            <Row>
              {currentProducts.map((product) => (
                <Col key={product._id} md={4} lg={3} className="mb-4">
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
              <div className="d-flex justify-content-center">
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
          <p className="text-center">Không có sản phẩm nào.</p>
        )}
      </Container>
    </section>
  );
}

export default ProductList;
