import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import "./CartPage.css";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (auth.user) {
        // Người dùng đã đăng nhập, lấy giỏ hàng từ server
        try {
          const response = await apiClient.get("/cart");
          setCart(response.data.products);
          updateCart();
        } catch (error) {
          setError("Error fetching cart.");
        } finally {
          setLoading(false);
        }
      } else {
        // Người dùng chưa đăng nhập, lấy giỏ hàng từ localStorage
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(localCart);
        setLoading(false);
      }
    };
    fetchCart();
  }, [updateCart, auth.user]);

  const updateQuantity = async (productId, increment) => {
    setActionLoading(true);
    try {
      const response = await apiClient.patch(
        `/cart/${productId}/${increment > 0 ? "increase" : "decrease"}`
      );
      setCart(response.data.products);
      updateCart();
    } catch (error) {
      setError("Error updating quantity.");
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/cart/${productId}`);
      setCart((prevCart) =>
        prevCart.filter((item) => item.product._id !== productId)
      );
      updateCart();
    } catch (error) {
      setError("Error removing item.");
    } finally {
      setActionLoading(false);
    }
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <div className="container mt-4">
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
        <div className="loading-spinner">Loading cart...</div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="bg-white rounded shadow-sm p-4">
              <h4 className="mb-4">Cart Items</h4>
              {cart.length === 0 ? (
                <p className="text-muted mt-3">Your cart is empty.</p>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div className="col-4">Product</div>
                    <div className="col-2 text-center">Quantity</div>
                    <div className="col-2 text-center">Price</div>
                    <div className="col-2 text-center">Total</div>
                    <div className="col-2 text-center">Remove</div>
                  </div>
                  {cart.map((item) => (
                    <div
                      className={`d-flex justify-content-between align-items-center border-bottom py-3 ${
                        actionLoading ? "loading-animation" : ""
                      }`}
                      key={item.product._id}
                    >
                      <div className="d-flex flex-column align-items-center col-4">
                        <img
                          src={`http://localhost:5000/products/${item.product.images[0]}`}
                          alt={item.product.title}
                          className="img-thumbnail product-image"
                          width="80"
                          height="80"
                        />
                        <div className="product-title">
                          <h5>{item.product.title}</h5>
                        </div>
                      </div>

                      <div className="quantity-controls col-2 text-center">
                        <FaMinus
                          className="btn-icon"
                          onClick={() =>
                            item.quantity > 1 &&
                            updateQuantity(item.product._id, -1)
                          }
                        />
                        <span className="quantity-text">{item.quantity}</span>
                        <FaPlus
                          className="btn-icon"
                          onClick={() => updateQuantity(item.product._id, 1)}
                        />
                      </div>

                      <div className="price-text col-2 text-center">
                        ${item.product.price.toFixed(1)}
                      </div>

                      <div className="price-text col-2 text-center">
                        ${(item.product.price * item.quantity).toFixed(1)}
                      </div>

                      <div className="col-2 text-center">
                        <FaTrashAlt
                          className="btn-icon text-danger"
                          onClick={() => removeItem(item.product._id)}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-white rounded shadow-sm p-4 order-summary">
              <h4 className="mb-4">Order Summary</h4>
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span className="price-text">
                  ${getTotalPrice().toFixed(1)}
                </span>
              </div>
              <div className="d-flex justify-content-between my-2">
                <span>Shipping</span>
                <span className="price-text">$12.90</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-3">
                <strong>Total</strong>
                <strong className="price-text">
                  ${(getTotalPrice() + 12.9).toFixed(2)}
                </strong>
              </div>

              <button className="btn btn-dark btn-block mt-4">
                Proceed to Checkout
              </button>
              <button className="btn btn-light btn-block mt-2">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
