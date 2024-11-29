import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaCartArrowDown,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
// CartPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { ToastContext } from "../ToastNotification/ToastContext"; // Đường dẫn tùy thuộc vào cấu trúc dự án của bạn
// Các import khác...

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [productDiscountCodes, setProductDiscountCodes] = useState({});
  const { addToast } = useContext(ToastContext); // Thêm vào đầu component

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
      updateCart(); // Update cart count in context

      // Thêm thông báo
      addToast("Cập nhật số lượng sản phẩm thành công", "success");
    } catch (error) {
      console.error("Error updating quantity:", error);
      addToast("Lỗi khi cập nhật số lượng sản phẩm", "danger");
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiClient.delete(`/cart/product/${productId}`);
      const response = await apiClient.get("/cart");
      setCart(response.data);
      updateCart(); // Update cart count in context

      // Thêm thông báo
      addToast("Sản phẩm đã được xóa khỏi giỏ hàng", "success");
    } catch (error) {
      console.error("Error removing item:", error);
      addToast("Lỗi khi xóa sản phẩm khỏi giỏ hàng", "danger");
    }
  };

  const applyCartDiscount = async () => {
    try {
      const response = await apiClient.post("/cart/apply-discount", {
        discountCode,
      });
      setCart(response.data);
      setDiscountError("");

      // Thêm thông báo
      addToast("Áp dụng mã giảm giá thành công", "success");
    } catch (error) {
      console.error("Error applying discount code:", error);
      setDiscountError(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc đã hết hạn."
      );

      // Thêm thông báo
      addToast(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
        "danger"
      );
    }
  };

  const removeCartDiscount = async () => {
    try {
      const response = await apiClient.post("/cart/remove-discount");
      setCart(response.data);
      setDiscountCode("");

      // Thêm thông báo
      addToast("Đã xóa mã giảm giá", "success");
    } catch (error) {
      console.error("Error removing discount code:", error);
      addToast("Lỗi khi xóa mã giảm giá", "danger");
    }
  };

  const applyProductDiscount = async (productId, discountCode) => {
    try {
      const response = await apiClient.post("/cart/product/apply-discount", {
        productId,
        discountCode,
      });
      setCart(response.data);
      // Xóa mã giảm giá sản phẩm trong input
      setProductDiscountCodes((prevCodes) => {
        const newCodes = { ...prevCodes };
        delete newCodes[productId];
        return newCodes;
      });

      // Thêm thông báo
      addToast("Áp dụng mã giảm giá cho sản phẩm thành công", "success");
    } catch (error) {
      console.error("Error applying product discount:", error);
      alert(
        error.response
          ? error.response.data?.message || "Đã xảy ra lỗi không xác định."
          : "Không thể kết nối tới server. Vui lòng thử lại sau."
      );

      // Thêm thông báo
      addToast(
        error.response?.data?.message ||
          "Mã giảm giá sản phẩm không hợp lệ hoặc đã hết hạn.",
        "danger"
      );
    }
  };

  const removeProductDiscount = async (productId) => {
    try {
      const response = await apiClient.delete(
        `/cart/product/${productId}/remove-discount`
      );
      setCart(response.data);

      // Thêm thông báo
      addToast("Đã xóa mã giảm giá cho sản phẩm", "success");
    } catch (error) {
      console.error("Error removing product discount:", error);
      addToast("Lỗi khi xóa mã giảm giá cho sản phẩm", "danger");
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
      addToast("Giỏ hàng của bạn đang trống.", "warning");
      return;
    }
    navigate("/checkout", { state: { cartItems: cart.products } });
  };

  const getTotalDiscount = () => {
    if (!cart || !cart.products) return 0;
    let totalDiscount = 0;

    // Tính tổng giảm giá của từng sản phẩm
    totalDiscount += cart.products.reduce((total, item) => {
      if (item.discount) {
        const discountAmount = item.discount.isPercentage
          ? (item.price * item.discount.value * item.quantity) / 100
          : item.discount.value * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);

    // Tính giảm giá của giỏ hàng nếu có
    if (cart.discountCode) {
      const cartDiscountAmount = cart.discountCode.isPercentage
        ? ((cart.totalAmount - totalDiscount) * cart.discountCode.value) / 100
        : cart.discountCode.value;
      totalDiscount += cartDiscountAmount;
    }

    return totalDiscount;
  };

  return (
    <div className="cartpage">
      <div className="container my-5">
        <div className="row">
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="col-xl-8">
            {loading ? (
              <div className="text-center" id="loading">
                Đang tải giỏ hàng...
              </div>
            ) : !cart || cart.products.length === 0 ? (
              <p className="text-center" id="empty-cart">
                Giỏ hàng của bạn đang trống.
              </p>
            ) : (
              <>
                <div id="cart-items">
                  {cart.products.map((item) => {
                    const discountAmount = item.discount
                      ? item.discount.isPercentage
                        ? (item.price * item.discount.value * item.quantity) /
                          100
                        : item.discount.value * item.quantity
                      : 0;
                    return (
                      <div
                        className="card border shadow-none mb-4"
                        key={item._id}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-start border-bottom pb-3">
                            <div className="me-4">
                              <img
                                src={
                                  item.product.images &&
                                  item.product.images.length > 0
                                    ? `${import.meta.env.VITE_API_BASE_URL.replace(
                                        "/api",
                                        ""
                                      )}/products/${item.product.images[0]}`
                                    : "/images/default-image.png"
                                }
                                alt={item.product.name}
                                className="avatar-lg rounded"
                              />
                            </div>
                            <div className="flex-grow-1 align-self-center overflow-hidden">
                              <h5>{item.product.name}</h5>
                            </div>
                            <div className="flex-shrink-0 ms-2">
                              <ul className="list-inline mb-0">
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
                              <p className="text-muted ">Giá</p>
                              <h5>{formatPrice(item.price)}</h5>
                            </div>
                            <div className="col-md-5 button-quantity">
                              <p className="text-muted">Số lượng</p>
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
                                  onClick={() =>
                                    updateQuantity(item.product._id, 1)
                                  }
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <p className="text-muted">Tổng</p>
                              <h5>{formatPrice(item.totalPrice)}</h5>
                            </div>
                          </div>
                          <div className="mt-3">
                            {item.discount ? (
                              <div>
                                <p>
                                  Mã giảm giá sản phẩm:{" "}
                                  <strong>{item.discount.code}</strong>
                                </p>
                                <p>
                                  Số tiền giảm giá:{" "}
                                  <strong>{formatPrice(discountAmount)}</strong>
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
                                  value={
                                    productDiscountCodes[item.product._id] || ""
                                  }
                                  onChange={(e) => {
                                    setProductDiscountCodes({
                                      ...productDiscountCodes,
                                      [item.product._id]: e.target.value,
                                    });
                                  }}
                                />
                                <button
                                  className="btn btn-primary"
                                  type="button"
                                  onClick={() =>
                                    applyProductDiscount(
                                      item.product._id,
                                      productDiscountCodes[item.product._id]
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
                    );
                  })}
                </div>
                <div className="row my-4">
                  <div className="col-sm-12 d-flex justify-content-between">
                    <button
                      onClick={() => navigate("/product")}
                      className="btn btn-link text-muted"
                      id="continue-shopping"
                    >
                      <FaArrowLeft className="me-1" /> Tiếp tục mua sắm
                    </button>
                    <button
                      onClick={handleProceedToCheckout}
                      className="btn btn-success"
                      id="proceed-to-checkout"
                    >
                      <FaCartArrowDown className="me-1" /> Thanh toán
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="col-xl-4">
            <div className="card border shadow-none">
              <div className="card-header bg-transparent border-bottom  text-center">
                <h5>Tóm tắt đơn hàng</h5>
              </div>
              <div className="card-body p-4 pt-2">
                <table className="table mb-0">
                  <tbody>
                    <tr>
                      <td>Tổng Tiền :</td>
                      <td className="text-end">
                        {formatPrice(getTotalPrice())}
                      </td>
                    </tr>
                    <tr>
                      <td>Tổng số sản phẩm :</td>
                      <td className="text-end">{getTotalQuantity()}</td>
                    </tr>
                    <tr>
                      <td>Tổng giảm giá :</td>
                      <td className="text-end">
                        {formatPrice(getTotalDiscount())}
                      </td>
                    </tr>
                    <tr className="bg-light">
                      <th>Tổng cộng :</th>
                      <td className="text-end fw-bold">
                        {formatPrice(getTotalPrice() - getTotalDiscount())}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4">
                  <h5>Mã giảm giá giỏ hàng</h5>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control text-discount-cart"
                      placeholder="Nhập mã giảm giá "
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      id="cart-discount-code"
                    />
                    <button
                      className="btn btn-primary text-discount-cart"
                      type="button"
                      onClick={applyCartDiscount}
                      id="apply-cart-discount"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {cart && cart.discountCode && (
                    <div className="mt-2" id="cart-discount-info">
                      <p>
                        Mã giảm giá đang áp dụng:{" "}
                        <strong>{cart.discountCode.code}</strong>
                      </p>
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={removeCartDiscount}
                      >
                        Xóa mã giảm giá
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <div className="text-danger mt-2" id="discount-error">
                      {discountError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
