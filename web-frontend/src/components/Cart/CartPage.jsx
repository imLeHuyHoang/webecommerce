import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import "./CartPage.css";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext"; // Import useCart

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { updateCart, incrementCartCount, decrementCartCount } = useCart(); // Sử dụng CartContext

  // Lấy dữ liệu giỏ hàng từ API hoặc localStorage
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);
    try {
      const response = token
        ? await apiClient.get("/cart", {
            headers: { Authorization: `Bearer ${token}` },
          })
        : JSON.parse(localStorage.getItem("cart")) || [];
      setCart(response.data ? response.data.products : response);
    } catch (error) {
      setError("Error loading cart.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, increment) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await apiClient.patch(
        `/cart/${productId}/${increment > 0 ? "increase" : "decrease"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.products);
      updateCart(); // Cập nhật số lượng giỏ hàng
    } catch (error) {
      setError("Error updating quantity.");
    }
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await apiClient.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prevCart) =>
        prevCart.filter((item) => item.product._id !== productId)
      );
      updateCart(); // Cập nhật số lượng giỏ hàng
    } catch (error) {
      setError("Error removing item.");
    }
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <div className="container mt-4">
      <nav className="navbar bg-white mb-4">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div className="logo">
            <div className="text-uppercase font-weight-bold name_logo">
              {" "}
              Tech Store{" "}
            </div>
          </div>
          <div>
            <a href="/" className="text-uppercase">
              Back to shopping
            </a>
          </div>
        </div>
      </nav>

      <header className="mb-4">
        <div className="d-flex justify-content-center align-items-center pb-3">
          <div className="px-4 step active">
            SHOPPING CART <span className="fas fa-check-circle"></span>
          </div>
          <div className="px-4 step">CHECKOUT</div>
          <div className="px-4 step">FINISH</div>
        </div>
        <div className="progress">
          <div
            className="progress-bar bg-success"
            style={{ width: "40%" }}
          ></div>
        </div>
      </header>

      {loading ? (
        <p className="text-center">Loading cart...</p>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="bg-white rounded shadow-sm p-4">
              <h4 className="mb-4">Cart Items</h4>

              <div className="d-flex justify-content-between border-bottom pb-2">
                <div style={{ width: "30%" }} className="text-center">
                  Product
                </div>
                <div style={{ width: "15%" }} className="text-center">
                  Quantity
                </div>
                <div style={{ width: "15%" }} className="text-center">
                  Unit Price
                </div>
                <div style={{ width: "20%" }} className="text-center">
                  Total
                </div>
                <div style={{ width: "10%" }} className="text-center">
                  Remove
                </div>
              </div>

              {cart.length === 0 ? (
                <p className="text-muted mt-3">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                    key={item.product._id}
                  >
                    <div
                      style={{ width: "30%", height: "80%" }}
                      className="d-flex align-items-center"
                    >
                      <img
                        src={`http://localhost:5000/products/${item.product.images[0]}`}
                        alt={item.product.title}
                        className="img-thumbnail mr-2"
                        width="80"
                        height="80"
                      />
                      <div>
                        <h5 className="mb-0">{item.product.title}</h5>
                      </div>
                    </div>

                    <div
                      style={{ width: "15%" }}
                      className="text-center d-flex align-items-center justify-content-center"
                    >
                      <FaMinus
                        className="btn-icon"
                        onClick={() =>
                          item.quantity > 1 &&
                          updateQuantity(item.product._id, -1)
                        }
                      />
                      <span className="mx-2">{item.quantity}</span>
                      <FaPlus
                        className="btn-icon"
                        onClick={() => updateQuantity(item.product._id, 1)}
                      />
                    </div>

                    <div style={{ width: "15%" }} className="text-center">
                      ${item.product.price.toFixed(2)}
                    </div>

                    <div style={{ width: "20%" }} className="text-center">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    <div style={{ width: "10%" }} className="text-center">
                      <FaTrashAlt
                        className="btn-icon text-danger"
                        onClick={() => removeItem(item.product._id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-white rounded shadow-sm p-4 order-summary">
              <h4 className="mb-4">Order Summary</h4>
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between my-2">
                <span>Shipping</span>
                <span>$12.90</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-3">
                <strong>Total</strong>
                <strong>${(getTotalPrice() + 12.9).toFixed(2)}</strong>
              </div>

              <div className="mt-4">
                <button className="btn btn-dark btn-block">
                  Proceed to Checkout
                </button>
                <button className="btn btn-light btn-block mt-2">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
