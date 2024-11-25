import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryForm from "../form/CategoryForm";
import ToastNotification from "../../ToastNotification/ToastNotification";
import "./ManageCategories.css"; // Import file CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/category";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setToast({
        show: true,
        message: "Failed to load categories",
        variant: "danger",
      });
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/${categoryId}`);
      setToast({
        show: true,
        message: "Category deleted successfully",
        variant: "success",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setToast({
        show: true,
        message: "Failed to delete category",
        variant: "danger",
      });
    }
  };

  const handleSaveCategory = () => {
    setShowModal(false);
    fetchCategories();
  };

  return (
    <>
      <div className="container mt-4 mb-2">
        <div className="row">
          <div className="col-12 col-md-6">
            <h2>Category Management</h2>
          </div>
          <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
            <button className="btn btn-primary" onClick={handleAddCategory}>
              Add New Category
            </button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Descriptions</th>
                    <th scope="col">Images</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>{cat.name}</td>
                      <td>{cat.descriptions}</td>
                      <td>
                        {cat.images.map((img, index) => (
                          <img
                            key={index}
                            src={`${import.meta.env.VITE_API_BASE_URL.replace(
                              "/api",
                              ""
                            )}/category/${img}`}
                            alt={cat.name}
                            className="category-image"
                          />
                        ))}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEditCategory(cat)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCategory(cat._id)}
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
        </div>
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedCategory ? "Edit Category" : "Add New Category"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CategoryForm
                  category={selectedCategory}
                  onSuccess={handleSaveCategory}
                  onCancel={() => setShowModal(false)}
                />
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

export default ManageCategories;
