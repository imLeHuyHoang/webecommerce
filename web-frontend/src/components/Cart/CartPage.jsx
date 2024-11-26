// components/CartPage/CartPage.js
import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (auth.user) {
          const response = await apiClient.get("/cart");
          setCart(response.data);
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
      if (increment > 0) {
        await apiClient.patch(`/cart/product/${productId}/increase`);
      } else {
        await apiClient.patch(`/cart/product/${productId}/decrease`);
      }
      const response = await apiClient.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiClient.delete(`/cart/product/${productId}`);
      const response = await apiClient.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const applyDiscountCode = async () => {
    try {
      const response = await apiClient.post("/cart/apply-discount", {
        discountCode,
      });
      setCart(response.data);
      setDiscountError("");
    } catch (error) {
      console.error("Error applying discount code:", error);
      setDiscountError(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc đã hết hạn."
      );
    }
  };

  const removeDiscountCode = async () => {
    try {
      const response = await apiClient.post("/cart/remove-discount");
      setCart(response.data);
      setDiscountCode("");
    } catch (error) {
      console.error("Error removing discount code:", error);
    }
  };

  const getTotalPrice = () => {
    return cart ? cart.totalAmount : 0;
  };

  const getTotalQuantity = () => {
    return cart ? cart.totalQuantity : 0;
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleProceedToCheckout = () => {
    if (!cart || cart.products.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    navigate("/checkout", { state: { cartItems: cart.products } });
  };

  const applyProductDiscount = async (productId, discountCode) => {
    try {
      const response = await apiClient.post("/cart/product/apply-discount", {
        productId,
        discountCode,
      });
      setCart(response.data);
    } catch (error) {
      console.error("Error applying product discount:", error);
      alert(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc không áp dụng cho sản phẩm này."
      );
    }
  };

  const removeProductDiscount = async (productId) => {
    try {
      const response = await apiClient.post(
        `/cart/product/${productId}/remove-discount`
      );
      setCart(response.data);
    } catch (error) {
      console.error("Error removing product discount:", error);
    }
  };

  return (
    <div className="container my-5">
      <div className="row">
        {/* Cart Items List */}
        <div className="col-xl-8">
          {loading ? (
            <div className="text-center">Đang tải giỏ hàng...</div>
          ) : !cart || cart.products.length === 0 ? (
            <p className="text-center">Giỏ hàng của bạn đang trống.</p>
          ) : (
            cart.products.map((item) => (
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
                          {item.product.name}
                        </a>
                      </h5>
                      {/* Additional product details if needed */}
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
                      <h5 className="mb-0">{formatPrice(item.price)}</h5>
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
                      <h5>{formatPrice(item.totalPrice)}</h5>
                    </div>
                  </div>

                  {/* Product Discount */}
                  <div className="mt-3">
                    {item.discount ? (
                      <div>
                        <p>
                          Mã giảm giá sản phẩm:{" "}
                          <strong>{item.discount.code}</strong>
                        </p>
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() =>
                            removeProductDiscount(item.product._id)
                          }
                        >
                          Xóa mã giảm giá
                        </button>
                      </div>
                    ) : (
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập mã giảm giá sản phẩm"
                          value={item.discountCodeInput || ""}
                          onChange={(e) => {
                            const newProducts = cart.products.map((p) =>
                              p.product._id === item.product._id
                                ? { ...p, discountCodeInput: e.target.value }
                                : p
                            );
                            setCart({ ...cart, products: newProducts });
                          }}
                        />
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() =>
                            applyProductDiscount(
                              item.product._id,
                              item.discountCodeInput
                            )
                          }
                        >
                          Áp dụng
                        </button>
                      </div>
                    )}
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
                      {formatPrice(getTotalPrice())}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4">
                <h5 className="font-size-15">Mã giảm giá giỏ hàng</h5>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã giảm giá giỏ hàng"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={applyDiscountCode}
                  >
                    Áp dụng
                  </button>
                </div>
                {cart && cart.discountCode && (
                  <div className="mt-2">
                    <p>
                      Mã giảm giá đang áp dụng:{" "}
                      <strong>{cart.discountCode.code}</strong>
                    </p>
                    <button
                      className="btn btn-link text-danger p-0"
                      onClick={removeDiscountCode}
                    >
                      Xóa mã giảm giá
                    </button>
                  </div>
                )}
                {discountError && (
                  <div className="text-danger mt-2">{discountError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
