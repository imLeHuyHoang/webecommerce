import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "../form/ProductForm";
import ToastNotification from "../../ToastNotification/ToastNotification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/product";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "",
  });

  // Lấy danh sách sản phẩm
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setToast({
        show: true,
        message: "Failed to load products",
        variant: "danger",
      });
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/${productId}`);
      setToast({
        show: true,
        message: "Product deleted successfully",
        variant: "success",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setToast({
        show: true,
        message: "Failed to delete product",
        variant: "danger",
      });
    }
  };

  const handleSaveProduct = () => {
    setShowModal(false);
    fetchProducts();
  };

  // in ra danh sách sản phẩm nhận dược từ API
  console.log(products);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h2>Product Management</h2>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          Add New Product
        </button>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Name</th>
              <th scope="col">Brand</th>
              <th scope="col">Price</th>
              <th scope="col">Category</th>
              <th scope="col">Attributes</th>
              <th scope="col">Images</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.brand}</td>
                <td>{product.price}</td>
                <td>{product.category?.name || "N/A"}</td>
                <td>
                  {product.attributes.map((attr, index) => (
                    <div key={index}>
                      {attr.key}: {attr.value}
                    </div>
                  ))}
                </td>
                <td>
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL.replace(
                        "/api",
                        ""
                      )}/products/${img}`}
                      alt={product.name}
                      style={{ width: "50px", marginRight: "5px" }}
                    />
                  ))}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </button>{" "}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form Sản phẩm */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProduct ? "Edit Product" : "Add New Product"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ProductForm
                  product={selectedProduct}
                  onSuccess={handleSaveProduct}
                  onCancel={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo Toast */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default ManageProducts;
