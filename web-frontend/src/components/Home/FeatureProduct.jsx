import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import ProductCard from "../Products/ProductCard";
import apiClient from "../../utils/api-client";
import "./FeatureProduct.css"; // Import CSS truyền thống

function FeatureProduct() {
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/product");
        const data = response.data;
        if (data && data.length > 0) {
          const randomProducts = data.slice(0, 4); // Chọn 4 sản phẩm đầu tiên
          setRandomProducts(randomProducts);
        }
      } catch (error) {
        setError("Không thể tải danh sách sản phẩm.");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <section className="featured-product">
      <Container className="featured-product-container">
        <h2 className="text-center mb-5 text-feature">
          Sản phẩm nổi bật hiện tại
        </h2>
        <Row className="row-product">
          {randomProducts.map((product) => (
            <Col key={product._id} className="position-card">
              <ProductCard
                id={product._id}
                stock={product.stock}
                rating={product.reviews?.rate || 0}
                ratingCount={product.reviews?.counts || 0}
                title={product.name}
                price={product.price}
                image={product.images?.[0]}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default FeatureProduct;
