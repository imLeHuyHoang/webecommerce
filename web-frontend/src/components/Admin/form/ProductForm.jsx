import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import apiClient from "../../../utils/api-client";
import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const productSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  attributes: z.array(
    z.object({
      key: z.string().min(1, "Attribute key is required"),
      value: z.string().min(1, "Attribute value is required"),
    })
  ),
  images: z.array(z.any()).optional(),
});

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    brand: "",
    price: 0,
    category: "",
    attributes: [],
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // Lấy danh sách categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL}/category`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Lấy attributes khi category thay đổi
  useEffect(() => {
    if (formData.category) {
      const fetchAttributes = async () => {
        try {
          const response = await apiClient.get(
            `${API_BASE_URL}/attributes/category/${formData.category}`
          );
          setAttributeOptions(response.data || []);
          setFormData((prevData) => ({
            ...prevData,
            attributes: response.data.map((attr) => ({
              key: attr.key,
              value: product
                ? product.attributes.find((a) => a.key === attr.key)?.value ||
                  ""
                : "",
            })),
          }));
        } catch (error) {
          console.error("Error fetching attributes:", error);
        }
      };
      fetchAttributes();
    } else {
      setAttributeOptions([]);
      setFormData((prevData) => ({ ...prevData, attributes: [] }));
    }
  }, [formData.category, product]);

  // Thiết lập dữ liệu ban đầu nếu đang chỉnh sửa
  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        category: product.category?._id || "",
        attributes: product.attributes,
        images: product.images || [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setFormData({ ...formData, images: files ? Array.from(files) : [] });
    } else if (name.startsWith("attribute_")) {
      const index = parseInt(name.split("_")[1]);
      const newAttributes = [...formData.attributes];
      newAttributes[index].value = value;
      setFormData({ ...formData, attributes: newAttributes });
    } else {
      setFormData({
        ...formData,
        [name]: name === "price" ? parseFloat(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate dữ liệu
      const validatedData = productSchema.parse(formData);

      // Chuẩn bị dữ liệu gửi đi
      const data = new FormData();
      data.append("code", validatedData.code);
      data.append("name", validatedData.name);
      data.append("description", validatedData.description);
      data.append("brand", validatedData.brand);
      data.append("price", validatedData.price);
      data.append("category", validatedData.category);
      data.append("attributes", JSON.stringify(validatedData.attributes));
      if (validatedData.images && validatedData.images.length > 0) {
        validatedData.images.forEach((image) => {
          data.append("images", image);
        });
      }

      // Thêm console.log để kiểm tra dữ liệu trong FormData
      console.log("FormData entries:");
      for (let pair of data.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      if (product) {
        // Cập nhật sản phẩm
        await apiClient.put(`${API_BASE_URL}/product/${product._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Tạo sản phẩm mới
        await apiClient.post(`${API_BASE_URL}/product`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorObject = {};
        error.errors.forEach((e) => {
          errorObject[e.path[0]] = e.message;
        });
        setErrors(errorObject);
      } else if (error.response && error.response.data) {
        // Xử lý lỗi từ backend
        setErrors({ form: error.response.data.message });
      } else {
        console.error("Error saving product:", error);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errors.form && (
        <div className="alert alert-danger" role="alert">
          {errors.form}
        </div>
      )}
      <Row>
        <Col md={6}>
          <Form.Group controlId="formProductCode" className="mb-3">
            <Form.Label>Code</Form.Label>
            <Form.Control
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              isInvalid={!!errors.code}
              disabled={!!product} // Không cho phép chỉnh sửa mã khi cập nhật
            />
            <Form.Control.Feedback type="invalid">
              {errors.code}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="formProductName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group controlId="formProductBrand" className="mb-3">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              isInvalid={!!errors.brand}
            />
            <Form.Control.Feedback type="invalid">
              {errors.brand}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="formProductPrice" className="mb-3">
            <Form.Label>Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                isInvalid={!!errors.price}
              />
            </InputGroup>
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="formProductDescription" className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="formProductCategory" className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          isInvalid={!!errors.category}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.category}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Thuộc tính động */}
      {attributeOptions.length > 0 && (
        <>
          <h5>Attributes</h5>
          {attributeOptions.map((attr, index) => (
            <Form.Group
              controlId={`attribute_${index}`}
              className="mb-3"
              key={index}
            >
              <Form.Label>{attr.key}</Form.Label>
              <Form.Control
                type="text"
                name={`attribute_${index}`}
                value={formData.attributes[index]?.value || ""}
                onChange={handleChange}
                isInvalid={!!errors.attributes}
              />
            </Form.Group>
          ))}
        </>
      )}

      <Form.Group controlId="formProductImages" className="mb-3">
        <Form.Label>Images</Form.Label>
        <Form.Control
          type="file"
          name="images"
          onChange={handleChange}
          multiple
          accept="image/*"
          isInvalid={!!errors.images}
        />
        <Form.Control.Feedback type="invalid">
          {errors.images}
        </Form.Control.Feedback>
        {/* Hiển thị hình ảnh hiện tại khi chỉnh sửa */}
        {product && product.images && product.images.length > 0 && (
          <div className="mt-2">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={`${API_BASE_URL.replace("/api", "")}/products/${img}`}
                alt={product.name}
                style={{ width: "50px", marginRight: "5px" }}
              />
            ))}
          </div>
        )}
      </Form.Group>

      <div className="text-end">
        <Button variant="secondary" onClick={onCancel} className="me-2">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;
