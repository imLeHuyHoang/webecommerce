import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Table,
  Image,
} from "react-bootstrap";
import apiClient from "../../../utils/api-client";

const CompareModal = ({ show, handleClose, currentProduct }) => {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    currentProduct.category._id
  );
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparisonData, setComparisonData] = useState(null);

  // Fetch danh sách danh mục khi modal mở
  useEffect(() => {
    if (show) {
      fetchCategories();
      // Reset state khi mở modal
      setSearch("");
      setBrand("");
      setProducts([]);
      setComparisonData(null);
      fetchProducts(selectedCategory, search, brand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/category");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async (categoryId, searchTerm, brandFilter) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        category: categoryId, // Sử dụng categoryId thay vì category name
        brand: brandFilter || undefined,
        search: searchTerm || undefined,
      };
      const response = await apiClient.get("/product", { params });
      // Loại bỏ sản phẩm hiện tại khỏi danh sách
      const filteredProducts = response.data.filter(
        (prod) => prod._id !== currentProduct._id
      );
      setProducts(filteredProducts);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm.");
      console.error("Error fetching products for comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (productToCompare) => {
    setLoading(true);
    setError("");
    try {
      // Gọi API so sánh sản phẩm
      const response = await apiClient.post("/product/compare", {
        productIds: [currentProduct._id, productToCompare._id],
      });
      setComparisonData(response.data);
    } catch (err) {
      setError("Không thể so sánh sản phẩm.");
      console.error("Error comparing products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setSelectedCategory(newCategoryId);
    fetchProducts(newCategoryId, search, brand);
  };

  const handleSearch = () => {
    fetchProducts(selectedCategory, search, brand);
  };

  const renderComparisonTable = () => {
    if (!comparisonData) return null;

    const [product1, product2] = comparisonData;

    // Lấy danh sách các thuộc tính chung
    const attributes1 = product1.attributes.reduce((acc, attr) => {
      acc[attr.key] = attr.value;
      return acc;
    }, {});

    const attributes2 = product2.attributes.reduce((acc, attr) => {
      acc[attr.key] = attr.value;
      return acc;
    }, {});

    const allKeys = Array.from(
      new Set([...Object.keys(attributes1), ...Object.keys(attributes2)])
    );

    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Thuộc Tính</th>
            <th>{product1.name}</th>
            <th>{product2.name}</th>
          </tr>
        </thead>
        <tbody>
          {/* So sánh hình ảnh */}
          <tr>
            <td>
              <strong>Hình Ảnh</strong>
            </td>
            <td>
              <Image
                src={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/products/${product1.images[0]}`}
                alt={product1.name}
                thumbnail
                style={{ width: "100px" }}
              />
            </td>
            <td>
              <Image
                src={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/products/${product2.images[0]}`}
                alt={product2.name}
                thumbnail
                style={{ width: "100px" }}
              />
            </td>
          </tr>

          {allKeys.map((key, idx) => (
            <tr key={idx}>
              <td>
                <strong>{key}</strong>
              </td>
              <td>{attributes1[key] || "N/A"}</td>
              <td>{attributes2[key] || "N/A"}</td>
            </tr>
          ))}

          {/* So sánh giá */}
          <tr>
            <td>
              <strong>Giá</strong>
            </td>
            <td>
              {product1.price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </td>
            <td>
              {product2.price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </td>
          </tr>
          {/* So sánh đánh giá */}
          <tr>
            <td>
              <strong>Đánh Giá</strong>
            </td>
            <td>
              {product1.averageRating} / 5 ({product1.reviewCount} đánh giá)
            </td>
            <td>
              {product2.averageRating} / 5 ({product2.reviewCount} đánh giá)
            </td>
          </tr>
          {/* So sánh tồn kho */}
          <tr>
            <td>
              <strong>Tồn Kho</strong>
            </td>
            <td>{product1.stock > 0 ? "Còn hàng" : "Hết hàng"}</td>
            <td>{product2.stock > 0 ? "Còn hàng" : "Hết hàng"}</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>So Sánh Sản Phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {comparisonData ? (
          renderComparisonTable()
        ) : (
          <>
            {/* Hiển thị danh mục hiện tại và chọn danh mục mới */}
            <Row className="mb-3">
              <Col md={6}>
                <Alert variant="info">
                  <strong>Danh Mục Hiện Tại:</strong>{" "}
                  {currentProduct.category.name}
                </Alert>
              </Col>
              <Col md={6}>
                <Form.Group controlId="selectCategory">
                  <Form.Label>Chọn Danh Mục Khác để So Sánh:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value={currentProduct.category._id}>
                      {currentProduct.category.name} (Hiện tại)
                    </option>
                    {categories
                      .filter((cat) => cat._id !== currentProduct.category._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Lọc theo thương hiệu"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="primary" onClick={handleSearch}>
                    Tìm
                  </Button>
                </Col>
              </Row>
            </Form>

            {loading && (
              <div className="text-center my-3">
                <Spinner animation="border" variant="primary" />
              </div>
            )}

            {error && (
              <Alert variant="danger" className="my-3">
                {error}
              </Alert>
            )}

            {!loading && !error && products.length === 0 && (
              <Alert variant="info" className="my-3">
                Không tìm thấy sản phẩm để so sánh.
              </Alert>
            )}

            {!loading && !error && products.length > 0 && (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {products.map((prod) => (
                  <Row key={prod._id} className="align-items-center mb-2">
                    <Col md={3}>
                      <Image
                        src={`${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/products/${prod.images[0]}`}
                        alt={prod.name}
                        thumbnail
                        style={{ width: "50px" }}
                      />
                    </Col>
                    <Col md={5}>
                      <strong>{prod.name}</strong> -{" "}
                      {prod.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </Col>
                    <Col md={4} className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleCompare(prod)}
                      >
                        So Sánh
                      </Button>
                    </Col>
                  </Row>
                ))}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {comparisonData && (
          <Button variant="secondary" onClick={() => setComparisonData(null)}>
            So Sánh Khác
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompareModal;
