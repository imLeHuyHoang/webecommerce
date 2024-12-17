// src/pages/ManageCategories/ManageCategories.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api-client";
import CategoryForm from "../form/CategoryForm";
import ToastNotification from "../../ToastNotification/ToastNotification";
import { getCategoryImageUrl } from "../../../utils/image-helper"; // Import helper
import "./ManageCategories.css"; // Import file CSS

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
      // Gọi đúng endpoint, giả sử GET /category trả về danh sách categories
      const response = await apiClient.get("/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setToast({
        show: true,
        message: "Không thể tải danh mục",
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?"))
      return;
    try {
      // Sử dụng template string đúng cách
      await apiClient.delete(`/category/${categoryId}`);
      setToast({
        show: true,
        message: "Xóa danh mục thành công",
        variant: "success",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setToast({
        show: true,
        message: "Không thể xóa danh mục",
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
      <div className="manage-category-container mt-4 mb-2">
        <div className="row">
          <div className="col-12 col-md-6">
            <h2>Quản lý danh mục</h2>
          </div>
          <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
            <button className="btn btn-primary" onClick={handleAddCategory}>
              Thêm danh mục mới
            </button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">Tên</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col">Hình ảnh</th>
                    <th scope="col">Hành động</th>
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
                            src={getCategoryImageUrl(img)} // Sử dụng helper
                            alt={cat.name}
                            className="manage-category-image"
                          />
                        ))}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditCategory(cat)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCategory(cat._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <p className="text-center">Không có danh mục nào được thêm.</p>
              )}
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
                  {selectedCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
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
