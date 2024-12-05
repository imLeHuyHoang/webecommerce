import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api-client";
import "./ManageInventory.css"; // Import CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ManageInventory = () => {
  // State variables
  const [inventories, setInventories] = useState([]); // List of inventories
  const [products, setProducts] = useState([]); // List of products
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedInventory, setSelectedInventory] = useState(null); // Selected inventory for editing
  const [form, setForm] = useState({
    product: "",
    productCode: "",
    location: "",
    quantity: "",
  }); // Form data
  const [productInfo, setProductInfo] = useState(null); // Selected product info
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering inventories
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products for product search

  // Fetch inventories and products when component mounts
  useEffect(() => {
    fetchInventories();
    fetchProducts();
  }, []);

  // Fetch inventories from server
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE_URL}/inventory`);
      setInventories(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Fetch products from server
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/product`);
      setProducts(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle add inventory button click
  const handleAddInventory = () => {
    setSelectedInventory(null);
    setForm({
      product: "",
      productCode: "",
      location: "",
      quantity: "",
    });
    setProductInfo(null);
    setShowModal(true);
  };

  // Handle edit inventory button click
  const handleEditInventory = (inventory) => {
    setSelectedInventory(inventory);
    setForm({
      product: inventory.product._id,
      productCode: inventory.product.code,
      location: inventory.location,
      quantity: inventory.quantity,
    });
    setProductInfo(inventory.product);
    setShowModal(true);
  };

  // Handle delete inventory button click
  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tồn kho này không?")) return;
    try {
      await apiClient.delete(`${API_BASE_URL}/inventory/${inventoryId}`);
      fetchInventories();
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle save inventory form submission
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi:", form); // Log form data for debugging

    try {
      if (selectedInventory) {
        // Update existing inventory
        await apiClient.put(
          `${API_BASE_URL}/inventory/${selectedInventory._id}`,
          form
        );
      } else {
        // Add new inventory
        await apiClient.post(`${API_BASE_URL}/inventory`, form);
      }
      setShowModal(false);
      fetchInventories();
    } catch (error) {
      console.error("Lỗi API:", error.response.data); // Log API error for debugging
      setError(error.message);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle product search input change
  const handleProductSearch = (e) => {
    const code = e.target.value;
    setForm({ ...form, productCode: code }); // Display product code in input

    if (code.length > 0) {
      const filtered = products.filter((product) =>
        product.code.toLowerCase().startsWith(code.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  // Handle product selection from search results
  const handleProductSelect = (product) => {
    setForm({ ...form, product: product._id, productCode: product.code }); // Save product ID and display code in input
    setProductInfo(product); // Display product info
    setFilteredProducts([]);
  };

  // Handle search term input change
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter inventories based on search term
  const filteredInventories = inventories.filter((inventory) => {
    return (
      inventory.product?.code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inventory.product?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inventory.product?.category?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Log products data for debugging
  console.log(products);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý tồn kho</h2>
        <button className="btn btn-primary" onClick={handleAddInventory}>
          Thêm tồn kho mới
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo mã sản phẩm, tên, hoặc danh mục"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
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
                <td>{inventory.product.name}</td>
                <td>{inventory.location}</td>
                <td>{inventory.quantity}</td>
                <td>{new Date(inventory.lastUpdated).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditInventory(inventory)}
                  >
                    Sửa
                  </button>{" "}
                  <button
                    className="btn btn-danger btn-sm"
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
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedInventory ? "Sửa tồn kho" : "Thêm tồn kho mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveInventory}>
                  <div className="mb-3">
                    <label htmlFor="product" className="form-label">
                      Mã sản phẩm
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="product"
                      name="productCode"
                      value={form.productCode}
                      onChange={handleProductSearch}
                      required
                    />
                    {filteredProducts.length > 0 && (
                      <ul className="list-group mt-2">
                        {filteredProducts.map((product) => (
                          <li
                            key={product._id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleProductSelect(product)}
                          >
                            {product.code} - {product.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {productInfo && (
                    <div className="mb-3">
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
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {selectedInventory ? "Cập nhật tồn kho" : "Thêm tồn kho"}
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
