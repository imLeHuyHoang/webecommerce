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
    maxDiscountValue: "",
    expiryDate: "",
    isActive: true,
    applicableProducts: [],
  });
  const [products, setProducts] = useState([]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
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
      console.error("Error fetching discounts:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
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
        maxDiscountValue: "",
        expiryDate: "",
        isActive: true,
        applicableProducts: [],
      });
      setEditingDiscountId(null);
      setShowForm(false);
      fetchDiscounts();
    } catch (error) {
      console.error("Error saving discount:", error);
    }
  };

  const handleEdit = (discount) => {
    setForm({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      isPercentage: discount.isPercentage,
      expiryDate: discount.expiryDate.split("T")[0],
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
        console.error("Error deleting discount:", error);
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
    const applicableProducts = products.filter((product) =>
      form.applicableProducts.includes(product._id)
    );
    return Math.min(...applicableProducts.map((product) => product.price));
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

  return (
    <div className="container my-5">
      <h2>Quản lý mã giảm giá</h2>

      {!showForm && (
        <button
          className="btn btn-primary mb-4"
          onClick={() => setShowForm(true)}
        >
          Tạo mới
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
              <option value="cart">Giỏ hàng</option>
              <option value="product">Sản phẩm</option>
            </select>
          </div>

          {form.type === "product" && (
            <div className="mb-3">
              <label className="form-label">Sản phẩm áp dụng</label>

              {/* Thanh tìm kiếm sản phẩm */}
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Tìm kiếm sản phẩm theo mã hoặc tên..."
                value={productSearchTerm}
                onChange={handleProductSearch}
              />

              {/* Kết quả tìm kiếm */}
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

              {/* Danh sách sản phẩm đã chọn */}
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
              Giảm giá theo phần trăm
            </label>
          </div>

          {form.isPercentage && (
            <div className="mb-3">
              <label className="form-label">Phần trăm giảm giá</label>
              <input
                type="text"
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
              <label className="form-label">Giá trị giảm giá</label>
              <input
                type="text"
                className="form-control"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
              {form.type === "product" && form.value > getMinProductPrice() && (
                <div className="text-danger">
                  Giá trị giảm giá không được lớn hơn giá trị sản phẩm nhỏ nhất
                </div>
              )}
            </div>
          )}

          {form.type === "cart" && (
            <div className="mb-3">
              <label className="form-label">Giá trị đơn hàng tối thiểu</label>
              <input
                type="text"
                className="form-control"
                value={form.minOrderValue}
                onChange={(e) =>
                  setForm({ ...form, minOrderValue: e.target.value })
                }
              />
            </div>
          )}

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
                maxDiscountValue: "",
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
            <th>Phần trăm</th>
            <th>Kích hoạt</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => (
            <tr key={discount._id}>
              <td>{discount.code}</td>
              <td>{discount.type}</td>
              <td>{discount.value}</td>
              <td>{discount.isPercentage ? "Có" : "Không"}</td>
              <td>{discount.isActive ? "Có" : "Không"}</td>
              <td>{new Date(discount.expiryDate).toLocaleDateString()}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDiscount;
