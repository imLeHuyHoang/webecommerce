import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (auth.user) {
          const response = await apiClient.get("/cart");
          setCartItems(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [auth.user]);

  const updateQuantity = async (productId, increment) => {
    try {
      if (auth.user) {
        await apiClient.patch(
          `/cart/${productId}/${increment > 0 ? "increase" : "decrease"}`
        );
      } else {
        const updatedCart = cartItems.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + increment }
            : item
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      updateCart();
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + increment }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      if (auth.user) {
        await apiClient.delete(`/cart/${productId}`);
      } else {
        const updatedCart = cartItems.filter(
          (item) => item.product._id !== productId
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      updateCart();
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product._id !== productId)
      );
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

  const getTotalQuantity = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    navigate("/checkout", { state: { cartItems } });
  };

  return (
    <div className="container my-5">
      <div className="row">
        {/* Cart Items List */}
        <div className="col-xl-8">
          {loading ? (
            <div className="text-center">Đang tải giỏ hàng...</div>
          ) : cartItems.length === 0 ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map((item) => (
              <div
                className="card border shadow-none mb-4"
                key={item.product._id}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start border-bottom pb-3">
                    <div className="me-4">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/products/${item.product.images[0]}`}
                        alt=""
                        className="avatar-lg rounded"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center overflow-hidden">
                      <h5 className="text-truncate font-size-18">
                        <a href="#" className="text-dark">
                          {item.product.title}
                        </a>
                      </h5>
                      <p className="text-muted mb-0">
                        {Array.from({ length: 5 }, (_, i) =>
                          i < item.product.rating ? (
                            <i key={i} className="bx bxs-star text-warning"></i>
                          ) : (
                            <i key={i} className="bx bx-star text-muted"></i>
                          )
                        )}
                      </p>
                      <p className="mb-0 mt-1">
                        <span className="fw-medium">{item.product.color}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <ul className="list-inline mb-0 font-size-16">
                        <li className="list-inline-item">
                          <button
                            className="btn btn-link text-muted px-1"
                            onClick={() => removeItem(item.product._id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-4">
                      <p className="text-muted mb-2">Giá</p>
                      <h5 className="mb-0">
                        {formatPrice(item.product.price)}
                      </h5>
                    </div>
                    <div className="col-md-5">
                      <p className="text-muted mb-2">Số lượng</p>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            item.quantity > 1 &&
                            updateQuantity(item.product._id, -1)
                          }
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => updateQuantity(item.product._id, 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <p className="text-muted mb-2">Tổng</p>
                      <h5>{formatPrice(item.product.price * item.quantity)}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="row my-4">
            <div className="col-sm-6">
              <button
                onClick={() => navigate("/products")}
                className="btn btn-link text-muted"
              >
                <i className="mdi mdi-arrow-left me-1"></i> Tiếp tục mua sắm
              </button>
            </div>
            <div className="col-sm-6 text-sm-end">
              <button
                onClick={handleProceedToCheckout}
                className="btn btn-success"
              >
                <i className="mdi mdi-cart-outline me-1"></i> Thanh toán
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-xl-4">
          <div className="card border shadow-none">
            <div className="card-header bg-transparent border-bottom py-3 px-4">
              <h5 className="font-size-16 mb-0">Tóm tắt đơn hàng</h5>
            </div>
            <div className="card-body p-4 pt-2">
              <table className="table mb-0">
                <tbody>
                  <tr>
                    <td>Tổng Tiền :</td>
                    <td className="text-end">{formatPrice(getTotalPrice())}</td>
                  </tr>
                  <tr>
                    <td>Tổng số sản phẩm :</td>
                    <td className="text-end">{getTotalQuantity()}</td>
                  </tr>
                  <tr className="bg-light">
                    <th>Tổng cộng :</th>
                    <td className="text-end fw-bold">
                      {formatPrice(getTotalPrice() + 25)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
