import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageInventory.css"; // Import CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    location: "",
    quantity: "",
  });
  const [productInfo, setProductInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Lấy dữ liệu tồn kho và sản phẩm khi component được mount
  useEffect(() => {
    fetchInventories();
    fetchProducts();
  }, []);

  // Hàm lấy dữ liệu tồn kho từ server
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setInventories(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu sản phẩm từ server
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product`);
      setProducts(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Hàm xử lý khi nhấn nút thêm tồn kho
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

  // Hàm xử lý khi nhấn nút sửa tồn kho
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

  // Hàm xử lý khi nhấn nút xóa tồn kho
  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tồn kho này không?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/inventory/${inventoryId}`);
      fetchInventories();
    } catch (error) {
      setError(error.message);
    }
  };

  // Hàm xử lý khi lưu tồn kho
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi:", form); // Log dữ liệu để kiểm tra

    try {
      if (selectedInventory) {
        // Cập nhật tồn kho
        await axios.put(
          `${API_BASE_URL}/inventory/${selectedInventory._id}`,
          form
        );
      } else {
        // Thêm tồn kho mới
        await axios.post(`${API_BASE_URL}/inventory`, form);
      }
      setShowModal(false);
      fetchInventories();
    } catch (error) {
      console.error("Lỗi API:", error.response.data); // Log lỗi để kiểm tra
      setError(error.message);
    }
  };

  // Hàm xử lý khi thay đổi giá trị trong form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Hàm xử lý tìm kiếm sản phẩm
  const handleProductSearch = (e) => {
    const code = e.target.value;
    setForm({ ...form, productCode: code }); // Hiển thị mã sản phẩm trong input

    if (code.length > 0) {
      const filtered = products.filter((product) =>
        product.code.toLowerCase().startsWith(code.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  // Hàm xử lý khi chọn sản phẩm từ danh sách
  const handleProductSelect = (product) => {
    setForm({ ...form, product: product._id, productCode: product.code }); // Lưu _id vào form.product và hiển thị code trong input
    setProductInfo(product); // Hiển thị thông tin sản phẩm
    setFilteredProducts([]);
  };

  // Hàm xử lý khi thay đổi giá trị tìm kiếm
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách tồn kho theo từ khóa tìm kiếm
  const filteredInventories = inventories.filter((inventory) => {
    return (
      inventory.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.product.category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // In ra dữ liệu gửi đến server
  console.log(form);

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
