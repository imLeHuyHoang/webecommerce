// src/pages/form/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import apiClient from "../../../utils/api-client";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  descriptions: z.string().optional(),
  // Ở đây mình không ép buộc 'images' = array, mà cho optional
  images: z.array(z.any()).optional(),
});

const CategoryForm = ({ category, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    descriptions: "",
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        descriptions: category.descriptions || "",
        images: category.images || [],
      });
    }
  }, [category]);

  // --- ĐIỂM ĐÃ SỬA ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      if (files.length > 1) {
        setImageError("Category chỉ cần 1 ảnh.");
      } else if (files.length === 0) {
        // Không chọn ảnh -> Giữ nguyên formData.images
        setImageError("");
      } else {
        // Chọn đúng 1 ảnh -> setFormData.images = files
        setImageError("");
        setFormData({ ...formData, images: Array.from(files) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate data bằng Zod
      const validatedData = categorySchema.parse(formData);

      // Tạo FormData để gửi lên server
      const data = new FormData();
      data.append("name", validatedData.name);
      data.append("descriptions", validatedData.descriptions || "");

      // Chỉ append ảnh nếu có file thực sự
      if (validatedData.images && validatedData.images.length > 0) {
        validatedData.images.forEach((image) => {
          data.append("images", image);
        });
      }

      if (category) {
        // Update category
        await apiClient.put(`/category/${category._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create category
        await apiClient.post("/category", data, {
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
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formCategoryName" className="mb-3">
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

      <Form.Group controlId="formCategoryDescriptions" className="mb-3">
        <Form.Label>Descriptions</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="descriptions"
          value={formData.descriptions}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group controlId="formCategoryImages" className="mb-3">
        <Form.Label>Images</Form.Label>
        <Form.Control
          type="file"
          name="images"
          onChange={handleChange}
          accept="image/*"
        />
        {imageError && <Alert variant="danger">{imageError}</Alert>}

        {/* Hiển thị ảnh cũ (nếu có) */}
        {category && category.images && category.images.length > 0 && (
          <div className="mt-2">
            {category.images.map((img, index) => (
              <img
                key={index}
                src={`/category/${img}`}
                alt={category.name}
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
        <Button variant="primary" type="submit" disabled={!!imageError}>
          {category ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </Form>
  );
};

export default CategoryForm;
