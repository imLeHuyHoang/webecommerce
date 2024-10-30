// ProductManagement.jsx - Techstore Admin Product Management

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Image,
} from "react-bootstrap";
import { z } from "zod";
import ToastNotification from "../../utils/ToastNotification";

// Define the validation schema using zod
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number"),
  category: z.string().min(1, "Category is required"),
  images: z
    .array(z.instanceof(File))
    .length(4, "Exactly 4 images are required"),
});

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch product list from server or database (mocked data for now)
    setProducts([
      {
        id: 1,
        title: "iPhone 14",
        price: 1200,
        stock: 15,
        category: "Phones",
        images: [],
      },
      {
        id: 2,
        title: "MacBook Pro",
        price: 2500,
        stock: 8,
        category: "Laptops",
        images: [],
      },
    ]);
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId));
    setToastMessage("Product deleted successfully");
    setShowToast(true);
  };

  const handleSaveProduct = () => {
    try {
      // Validate the selected product using the schema
      productSchema.parse(selectedProduct);

      if (selectedProduct.id) {
        // Update existing product
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === selectedProduct.id ? selectedProduct : product
          )
        );
        setToastMessage("Product updated successfully");
      } else {
        // Add new product
        setProducts((prevProducts) => [
          ...prevProducts,
          { ...selectedProduct, id: prevProducts.length + 1 },
        ]);
        setToastMessage("Product added successfully");
      }
      setShowToast(true);
      setShowModal(false);
      setErrors({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Set validation errors
        const errorObject = {};
        e.errors.forEach((error) => {
          errorObject[error.path[0]] = error.message;
        });
        setErrors(errorObject);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setSelectedProduct({
        ...selectedProduct,
        images: Array.from(files),
      });
    } else {
      setSelectedProduct({
        ...selectedProduct,
        [name]: name === "price" || name === "stock" ? Number(value) : value,
      });
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Product Management</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={handleAddProduct}>
            Add New Product
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.title}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEditProduct(product)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct?.id ? "Edit Product" : "Add New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formProductTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={selectedProduct?.title || ""}
                onChange={handleChange}
                isInvalid={!!errors.title}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={selectedProduct?.description || ""}
                onChange={handleChange}
                isInvalid={!!errors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={selectedProduct?.price || ""}
                onChange={handleChange}
                isInvalid={!!errors.price}
                min="0"
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={selectedProduct?.stock || ""}
                onChange={handleChange}
                isInvalid={!!errors.stock}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.stock}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={selectedProduct?.category || ""}
                onChange={handleChange}
                isInvalid={!!errors.category}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.category}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductImages">
              <Form.Label>Product Images (4 required)</Form.Label>
              <Form.Control
                type="file"
                name="images"
                onChange={handleChange}
                isInvalid={!!errors.images}
                multiple
                accept="image/*"
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.images}
              </Form.Control.Feedback>
              <div className="mt-3">
                {selectedProduct?.images?.map((image, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(image)}
                    thumbnail
                    className="me-2"
                    style={{ width: "100px", height: "100px" }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </Container>
  );
};

export default ProductManagement;
