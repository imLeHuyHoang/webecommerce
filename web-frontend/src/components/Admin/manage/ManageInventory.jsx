import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api-client";
import "./ManageInventory.css";

const ManageInventory = () => {
  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [form, setForm] = useState({
    product: "",
    productCode: "",
    productName: "",
    location: "",
    quantity: "",
  });
  const [productInfo, setProductInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSearchField, setActiveSearchField] = useState(null); // 'code' or 'name'

  useEffect(() => {
    fetchInventories();
    fetchProducts();
  }, []);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/inventory");
      setInventories(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/product");
      setProducts(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    setForm({
      product: "",
      productCode: "",
      productName: "",
      location: "",
      quantity: "",
    });
    setProductInfo(null);
    setShowModal(true);
  };

  const handleEditInventory = (inventory) => {
    setSelectedInventory(inventory);
    setForm({
      product: inventory.product._id,
      productCode: inventory.product.code,
      productName: inventory.product.name,
      location: inventory.location,
      quantity: inventory.quantity,
    });
    setProductInfo(inventory.product);
    setShowModal(true);
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tồn kho này không?")) return;
    try {
      await apiClient.delete(`/inventory/${inventoryId}`);
      fetchInventories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    try {
      if (selectedInventory) {
        // Update existing inventory
        await apiClient.put(`/inventory/${selectedInventory._id}`, form);
      } else {
        // Add new inventory
        await apiClient.post("/inventory", form);
      }
      setShowModal(false);
      fetchInventories();
    } catch (error) {
      console.error("Lỗi API:", error.response?.data);
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductCodeChange = (e) => {
    const code = e.target.value;
    setForm({
      ...form,
      productCode: code,
      productName: "", // Reset productName if user is typing code
    });
    setActiveSearchField("code");

    if (code.length > 0) {
      const filtered = products.filter(
        (product) =>
          product.code.toLowerCase().startsWith(code.toLowerCase()) ||
          product.name.toLowerCase().startsWith(code.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      // Show all products if input is empty
      setFilteredProducts(products);
    }
  };

  const handleProductNameChange = (e) => {
    const name = e.target.value;
    setForm({
      ...form,
      productName: name,
      productCode: "", // Reset productCode if user is typing name
    });
    setActiveSearchField("name");

    if (name.length > 0) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().startsWith(name.toLowerCase()) ||
          product.code.toLowerCase().startsWith(name.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      // Show all products if input is empty
      setFilteredProducts(products);
    }
  };

  const handleProductSelect = (product) => {
    setForm({
      ...form,
      product: product._id,
      productCode: product.code,
      productName: product.name,
    });
    setProductInfo(product);
    setFilteredProducts([]);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventories = inventories.filter((inventory) => {
    const term = searchTerm.toLowerCase();
    return (
      inventory.product?.code?.toLowerCase().includes(term) ||
      inventory.product?.name?.toLowerCase().includes(term) ||
      inventory.product?.category?.name?.toLowerCase().includes(term)
    );
  });

  console.log(products);

  return (
    <div className="manage-inventory-container container mt-4">
      <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý kho hàng</h2>
        <button
          className="manage-inventory-add-btn btn btn-primary"
          onClick={handleAddInventory}
        >
          Thêm số lượng cho sản phẩm
        </button>
      </div>

      <div className="manage-inventory-search mb-4">
        <input
          type="text"
          className="manage-inventory-search-input form-control"
          placeholder="Tìm kiếm theo tên hoặc mã sản phẩm"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>

      {error && (
        <div className="manage-inventory-error alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="manage-inventory-loading">Đang tải...</div>
      ) : (
        <table className="manage-inventory-table table table-striped table-bordered">
          <thead className="manage-inventory-thead thead-dark">
            <tr>
              <th>Mã sản phẩm</th>
              <th>Sản phẩm</th>
              <th>Địa điểm</th>
              <th>Số lượng</th>
              <th>Cập nhật lần cuối</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.map((inventory) => (
              <tr key={inventory._id}>
                <td>{inventory.product.code}</td>
                <td>{inventory.product.name}</td>
                <td>{inventory.location}</td>
                <td>{inventory.quantity}</td>
                <td>{new Date(inventory.lastUpdated).toLocaleString()}</td>
                <td>
                  <button
                    className="manage-inventory-edit-btn btn btn-warning btn-sm"
                    onClick={() => handleEditInventory(inventory)}
                  >
                    Sửa
                  </button>{" "}
                  <button
                    className="manage-inventory-delete-btn btn btn-danger btn-sm"
                    onClick={() => handleDeleteInventory(inventory._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div
          className="manage-inventory-modal modal show d-block"
          tabIndex="-1"
        >
          <div className="manage-inventory-modal-dialog modal-dialog">
            <div className="manage-inventory-modal-content modal-content">
              <div className="manage-inventory-modal-header modal-header">
                <h5 className="manage-inventory-modal-title modal-title">
                  {selectedInventory ? "Sửa tồn kho" : "Thêm tồn kho mới"}
                </h5>
                <button
                  type="button"
                  className="manage-inventory-modal-close btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="manage-inventory-modal-body modal-body">
                <form onSubmit={handleSaveInventory}>
                  <div className="manage-inventory-form-group mb-3 position-relative">
                    <label
                      htmlFor="productCode"
                      className="manage-inventory-form-label form-label"
                    >
                      Mã sản phẩm
                    </label>
                    <input
                      type="text"
                      className="manage-inventory-form-control form-control"
                      id="productCode"
                      name="productCode"
                      value={form.productCode}
                      onChange={handleProductCodeChange}
                      onFocus={() => {
                        setActiveSearchField("code");
                        if (form.productCode === "") {
                          setFilteredProducts(products);
                        }
                      }}
                      required
                    />
                    {activeSearchField === "code" &&
                      filteredProducts.length > 0 && (
                        <ul className="manage-inventory-product-list list-group mt-2">
                          {filteredProducts.map((product) => (
                            <li
                              key={product._id}
                              className="manage-inventory-product-item list-group-item list-group-item-action"
                              onClick={() => handleProductSelect(product)}
                            >
                              {product.code} - {product.name}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <div className="manage-inventory-form-group mb-3 position-relative">
                    <label
                      htmlFor="productName"
                      className="manage-inventory-form-label form-label"
                    >
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      className="manage-inventory-form-control form-control"
                      id="productName"
                      name="productName"
                      value={form.productName}
                      onChange={handleProductNameChange}
                      onFocus={() => {
                        setActiveSearchField("name");
                        if (form.productName === "") {
                          setFilteredProducts(products);
                        }
                      }}
                      required
                    />
                    {activeSearchField === "name" &&
                      filteredProducts.length > 0 && (
                        <ul className="manage-inventory-product-list list-group mt-2">
                          {filteredProducts.map((product) => (
                            <li
                              key={product._id}
                              className="manage-inventory-product-item list-group-item list-group-item-action"
                              onClick={() => handleProductSelect(product)}
                            >
                              {product.code} - {product.name}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  {productInfo && (
                    <div className="manage-inventory-product-info mb-3">
                      <p>
                        <strong>Tên sản phẩm:</strong> {productInfo.name}
                      </p>
                      <p>
                        <strong>Danh mục:</strong> {productInfo.category.name}
                      </p>
                      <p>
                        <strong>Giá:</strong> ${productInfo.price}
                      </p>
                    </div>
                  )}

                  <div className="manage-inventory-form-group mb-3">
                    <label
                      htmlFor="location"
                      className="manage-inventory-form-label form-label"
                    >
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      className="manage-inventory-form-control form-control"
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="manage-inventory-form-group mb-3">
                    <label
                      htmlFor="quantity"
                      className="manage-inventory-form-label form-label"
                    >
                      Số lượng
                    </label>
                    <input
                      type="number"
                      className="manage-inventory-form-control form-control"
                      id="quantity"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="manage-inventory-form-actions text-end">
                    <button
                      type="button"
                      className="manage-inventory-cancel-btn btn btn-secondary me-2"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="manage-inventory-save-btn btn btn-primary"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInventory;
