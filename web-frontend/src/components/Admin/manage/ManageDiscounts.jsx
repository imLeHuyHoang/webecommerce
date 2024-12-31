// src/components/Admin/ManageDiscounts/ManageDiscount.js

import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./ManageDiscounts.css";

const ManageDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "cart",
    value: "",
    isPercentage: false,
    minOrderValue: "",
    startDate: "",
    expiryDate: "",
    isActive: true,
    applicableProducts: [],
  });
  const [products, setProducts] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Các trường lọc
  const [filterCode, setFilterCode] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterExpiryDate, setFilterExpiryDate] = useState("");

  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await apiClient.get("/discounts");
      setDiscounts(response.data);
    } catch (error) {
      console.error("Lỗi tải mã giảm giá:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDiscountId) {
        await apiClient.put(`/discounts/${editingDiscountId}`, form);
      } else {
        await apiClient.post("/discounts", form);
      }
      setForm({
        code: "",
        type: "cart",
        value: "",
        isPercentage: false,
        minOrderValue: "",
        startDate: "",
        expiryDate: "",
        isActive: true,
        applicableProducts: [],
      });
      setEditingDiscountId(null);
      setShowForm(false);
      fetchDiscounts();
    } catch (error) {
      console.error("Lỗi lưu mã giảm giá:", error);
    }
  };

  const handleEdit = (discount) => {
    setForm({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      isPercentage: discount.isPercentage,
      minOrderValue: discount.minOrderValue
        ? discount.minOrderValue.toString()
        : "",
      startDate: discount.startDate ? discount.startDate.split("T")[0] : "",
      expiryDate: discount.expiryDate ? discount.expiryDate.split("T")[0] : "",
      isActive: discount.isActive,
      applicableProducts: discount.applicableProducts.map((p) => p._id),
    });
    setEditingDiscountId(discount._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      try {
        await apiClient.delete(`/discounts/${id}`);
        fetchDiscounts();
      } catch (error) {
        console.error("Lỗi xóa mã giảm giá:", error);
      }
    }
  };

  const handleProductSearch = (e) => {
    const searchTerm = e.target.value;
    setProductSearchTerm(searchTerm);

    if (searchTerm.trim() === "") {
      setProductSearchResults([]);
      return;
    }

    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setProductSearchResults(results);
  };

  const handleAddProduct = (product) => {
    if (!form.applicableProducts.includes(product._id)) {
      setForm({
        ...form,
        applicableProducts: [...form.applicableProducts, product._id],
      });
    }
    setProductSearchTerm("");
    setProductSearchResults([]);
  };

  const handleRemoveProduct = (productId) => {
    setForm({
      ...form,
      applicableProducts: form.applicableProducts.filter(
        (id) => id !== productId
      ),
    });
  };

  const getMinProductPrice = () => {
    if (form.applicableProducts.length === 0) return 0;
    const applicableProductsList = products.filter((product) =>
      form.applicableProducts.includes(product._id)
    );
    return Math.min(...applicableProductsList.map((product) => product.price));
  };

  const validateDiscountValue = () => {
    if (form.isPercentage) {
      return form.value > 0 && form.value <= 100;
    } else {
      if (form.type === "product") {
        return form.value > 0 && form.value <= getMinProductPrice();
      }
      return form.value > 0;
    }
  };

  // Lọc discount theo bộ lọc
  const filteredDiscounts = discounts.filter((discount) => {
    const today = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.expiryDate);

    let match = true;

    if (filterCode.trim()) {
      match =
        match && discount.code.toLowerCase().includes(filterCode.toLowerCase());
    }

    if (filterType) {
      match = match && discount.type === filterType;
    }

    if (filterStartDate) {
      const filterStart = new Date(filterStartDate);
      match = match && start >= filterStart;
    }

    if (filterExpiryDate) {
      const filterEnd = new Date(filterExpiryDate);
      match = match && end <= filterEnd;
    }

    return match;
  });

  return (
    <div className="manage-discount-container my-5">
      <h2>Quản lý mã giảm giá</h2>

      {/* Khu vực lọc */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã giảm giá..."
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">--Chọn loại giảm giá--</option>
            <option value="cart">Giảm giá cho giỏ hàng</option>
            <option value="product">Giảm giá cho sản phẩm</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filterExpiryDate}
            onChange={(e) => setFilterExpiryDate(e.target.value)}
          />
        </div>
      </div>

      {!showForm && (
        <button
          className="btn btn-primary mb-4"
          onClick={() => setShowForm(true)}
        >
          Tạo mã giảm giá mới
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="my-4">
          <div className="mb-3">
            <label className="form-label">Mã giảm giá</label>
            <input
              type="text"
              className="form-control"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Loại giảm giá</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              <option value="cart">Giảm giá cho giỏ hàng</option>
              <option value="product">Giảm giá cho sản phẩm</option>
            </select>
          </div>

          {form.type === "product" && (
            <div className="mb-3">
              <label className="form-label">Sản phẩm áp dụng</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Tìm kiếm sản phẩm..."
                value={productSearchTerm}
                onChange={handleProductSearch}
              />

              {productSearchResults.length > 0 && (
                <ul className="list-group">
                  {productSearchResults.map((product) => (
                    <li
                      key={product._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleAddProduct(product)}
                    >
                      {product.code} - {product.name}
                    </li>
                  ))}
                </ul>
              )}

              {form.applicableProducts.length > 0 && (
                <div className="mt-3">
                  <h6>Sản phẩm đã chọn:</h6>
                  <ul className="list-group">
                    {form.applicableProducts.map((productId) => {
                      const product = products.find((p) => p._id === productId);
                      if (!product) return null;
                      return (
                        <li
                          key={productId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {product.code} - {product.name}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveProduct(productId)}
                          >
                            Xóa
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPercentage"
              checked={form.isPercentage}
              onChange={(e) =>
                setForm({ ...form, isPercentage: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor="isPercentage">
              Giảm giá theo %
            </label>
          </div>

          {form.isPercentage && (
            <div className="mb-3">
              <label className="form-label">Phần trăm giảm giá</label>
              <input
                type="number"
                className="form-control"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
              {form.value > 100 && (
                <div className="text-danger">
                  Phần trăm giảm giá không được lớn hơn 100%
                </div>
              )}
            </div>
          )}

          {!form.isPercentage && (
            <div className="mb-3">
              <label className="form-label">Giá trị giảm giá (VNĐ)</label>
              <input
                type="number"
                className="form-control"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
              {form.type === "product" && form.value > getMinProductPrice() && (
                <div className="text-danger">
                  Giá trị giảm giá không được lớn hơn giá trị sản phẩm thấp nhất
                </div>
              )}
            </div>
          )}

          {form.type === "cart" && (
            <div className="mb-3">
              <label className="form-label">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                className="form-control"
                value={form.minOrderValue}
                onChange={(e) =>
                  setForm({ ...form, minOrderValue: e.target.value })
                }
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-control"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Ngày hết hạn</label>
            <input
              type="date"
              className="form-control"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="isActive">
              Kích hoạt
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!validateDiscountValue()}
          >
            {editingDiscountId ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => {
              setForm({
                code: "",
                type: "cart",
                value: "",
                isPercentage: false,
                minOrderValue: "",
                startDate: "",
                expiryDate: "",
                isActive: true,
                applicableProducts: [],
              });
              setEditingDiscountId(null);
              setShowForm(false);
              setProductSearchTerm("");
              setProductSearchResults([]);
            }}
          >
            Hủy
          </button>
        </form>
      )}

      <h3>Danh sách mã giảm giá</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Giảm giá %</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày hết hạn</th>
            <th>Đang hoạt động</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiscounts.map((discount) => {
            const today = new Date();
            const start = new Date(discount.startDate);
            const end = new Date(discount.expiryDate);
            const isCurrentlyActive =
              discount.isActive && today >= start && today <= end;
            return (
              <tr key={discount._id}>
                <td>{discount.code}</td>
                <td>{discount.type}</td>
                <td>{discount.value}</td>
                <td>{discount.isPercentage ? "Có" : "Không"}</td>
                <td>{new Date(discount.startDate).toLocaleDateString()}</td>
                <td>{new Date(discount.expiryDate).toLocaleDateString()}</td>
                <td>{isCurrentlyActive ? "Có" : "Không"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(discount)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(discount._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDiscount;
