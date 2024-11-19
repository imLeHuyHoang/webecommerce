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
    location: "",
    quantity: "",
  });
  const [productInfo, setProductInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchInventories();
    fetchProducts();
  }, []);

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

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product`);
      setProducts(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    setForm({
      product: "",
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
      location: inventory.location,
      quantity: inventory.quantity,
    });
    setProductInfo(inventory.product);
    setShowModal(true);
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (!window.confirm("Are you sure you want to delete this inventory?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/inventory/${inventoryId}`);
      fetchInventories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    try {
      if (selectedInventory) {
        // Update inventory
        await axios.put(
          `${API_BASE_URL}/inventory/${selectedInventory._id}`,
          form
        );
      } else {
        // Add new inventory
        await axios.post(`${API_BASE_URL}/inventory`, form);
      }
      setShowModal(false);
      fetchInventories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductSearch = async (e) => {
    const code = e.target.value;
    setForm({ ...form, product: code });

    if (code.length > 0) {
      const filtered = products.filter((product) =>
        product.code.toLowerCase().startsWith(code.toLowerCase())
      );
      setFilteredProducts(filtered);

      if (
        filtered.length === 1 &&
        filtered[0].code.toLowerCase() === code.toLowerCase()
      ) {
        setProductInfo(filtered[0]);
      } else {
        setProductInfo(null);
      }
    } else {
      setFilteredProducts([]);
      setProductInfo(null);
    }
  };

  const handleProductSelect = (product) => {
    setForm({ ...form, product: product.code });
    setProductInfo(product);
    setFilteredProducts([]);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventories = inventories.filter((inventory) => {
    return (
      inventory.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.product.category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  //in ra data gửi đến server
  console.log(form);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory Management</h2>
        <button className="btn btn-primary" onClick={handleAddInventory}>
          Add New Inventory
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by product code, name, or category"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Last Updated</th>
              <th>Actions</th>
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
                    Edit
                  </button>{" "}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteInventory(inventory._id)}
                  >
                    Delete
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
                  {selectedInventory ? "Edit Inventory" : "Add New Inventory"}
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
                      Product Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="product"
                      name="product"
                      value={form.product}
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
                        <strong>Product Name:</strong> {productInfo.name}
                      </p>
                      <p>
                        <strong>Category:</strong> {productInfo.category.name}
                      </p>
                      <p>
                        <strong>Price:</strong> ${productInfo.price}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      Location
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
                      Quantity
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
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {selectedInventory ? "Update Inventory" : "Add Inventory"}
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
