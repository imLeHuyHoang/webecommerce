import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import ToastNotification from "../../ToastNotification/ToastNotification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const attributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  type: z.enum(["String", "Number", "Boolean"]),
});

const ManageAttributes = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "",
  });

  // Lấy danh sách categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Lấy attributes khi category thay đổi
  useEffect(() => {
    if (selectedCategoryId) {
      fetchAttributes();
    } else {
      setAttributes([]);
    }
  }, [selectedCategoryId]);

  const fetchAttributes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attributes/category/${selectedCategoryId}`
      );
      setAttributes(response.data || []);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  const handleAddAttribute = () => {
    setSelectedAttribute(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEditAttribute = (attribute) => {
    setSelectedAttribute(attribute);
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteAttribute = async (attributeId) => {
    if (!window.confirm("Are you sure you want to delete this attribute?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/attributes/${attributeId}`);
      setToast({
        show: true,
        message: "Attribute deleted successfully",
        variant: "success",
      });
      fetchAttributes();
    } catch (error) {
      console.error("Error deleting attribute:", error);
      setToast({
        show: true,
        message: "Failed to delete attribute",
        variant: "danger",
      });
    }
  };

  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    try {
      // Validate data
      const attributeData = {
        categoryId: selectedCategoryId,
        key: e.target.key.value,
        type: e.target.type.value,
      };
      attributeSchema.parse(attributeData);

      if (selectedAttribute) {
        // Update attribute
        await axios.put(
          `${API_BASE_URL}/attributes/${selectedAttribute._id}`,
          attributeData
        );
        setToast({
          show: true,
          message: "Attribute updated successfully",
          variant: "success",
        });
      } else {
        // Add new attribute
        await axios.post(`${API_BASE_URL}/attributes`, attributeData);
        setToast({
          show: true,
          message: "Attribute added successfully",
          variant: "success",
        });
      }
      setShowModal(false);
      setErrors({});
      fetchAttributes();
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
        console.error("Error saving attribute:", error);
      }
    }
  };

  return (
    <>
      <div className="container mt-4 mb-2">
        <h2>Attribute Management</h2>
        <div className="row mt-3 mb-3">
          <div className="col-12 col-md-6">
            <select
              className="form-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
            {selectedCategoryId && (
              <button className="btn btn-primary" onClick={handleAddAttribute}>
                Add New Attribute
              </button>
            )}
          </div>
        </div>

        {attributes.length > 0 && (
          <div className="row">
            <div className="col-12">
              <table className="table table-striped table-bordered table-hover table-responsive">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attr) => (
                    <tr key={attr._id}>
                      <td>{attr.key}</td>
                      <td>{attr.type}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEditAttribute(attr)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAttribute(attr._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Attribute Form Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedAttribute ? "Edit Attribute" : "Add New Attribute"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {errors.form && (
                  <div className="alert alert-danger">{errors.form}</div>
                )}
                <form onSubmit={handleSaveAttribute}>
                  <div className="mb-3">
                    <label htmlFor="formAttributeKey" className="form-label">
                      Attribute Key
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.key ? "is-invalid" : ""
                      }`}
                      id="formAttributeKey"
                      name="key"
                      defaultValue={selectedAttribute?.key || ""}
                    />
                    {errors.key && (
                      <div className="invalid-feedback">{errors.key}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="formAttributeType" className="form-label">
                      Attribute Type
                    </label>
                    <select
                      className="form-select"
                      id="formAttributeType"
                      name="type"
                      defaultValue={selectedAttribute?.type || "String"}
                    >
                      <option value="String">String</option>
                      <option value="Number">Number</option>
                      <option value="Boolean">Boolean</option>
                    </select>
                  </div>

                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {selectedAttribute ? "Update Attribute" : "Add Attribute"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default ManageAttributes;
