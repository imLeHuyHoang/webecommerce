import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { z } from "zod";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/category`;

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  descriptions: z.string().optional(),
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      if (files.length > 1) {
        setImageError("Category chỉ cần 1 ảnh.");
      } else {
        setImageError("");
        setFormData({ ...formData, images: files ? Array.from(files) : [] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate data
      const validatedData = categorySchema.parse(formData);

      // Prepare form data
      const data = new FormData();
      data.append("name", validatedData.name);
      data.append("descriptions", validatedData.descriptions || "");
      validatedData.images.forEach((image) => {
        data.append("images", image);
      });

      if (category) {
        // Update category
        await axios.put(`${API_BASE_URL}/${category._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create category
        await axios.post(API_BASE_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (error) {
      // ... error handling
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
        {/* Display existing images when editing */}
        {category && category.images && (
          <div className="mt-2">
            {category.images.map((img, index) => (
              <img
                key={index}
                src={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/category/${img}`}
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
