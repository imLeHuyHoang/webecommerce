// src/components/CartPage/CartPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";
import { FaTrashAlt, FaArrowLeft, FaCartArrowDown } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ToastContext } from "../ToastNotification/ToastContext";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  Image,
  Card,
  InputGroup,
} from "react-bootstrap";
import "./CartPage.css";

const CartPage = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const { updateCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [productDiscountCodes, setProductDiscountCodes] = useState({});
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (auth.user) {
          const response = await apiClient.get("/cart");
          setCart(response.data);
        } else {
          setCart({ products: [] });
        }
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
      updateCart();
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
      updateCart();
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
      addToast("Áp dụng mã giảm giá thành công", "success");
    } catch (error) {
      console.error("Error applying discount code:", error);
      setDiscountError(
        error.response?.data?.message ||
          "Mã giảm giá không hợp lệ hoặc đã hết hạn."
      );
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
      setProductDiscountCodes((prevCodes) => {
        const newCodes = { ...prevCodes };
        delete newCodes[productId];
        return newCodes;
      });
      addToast("Áp dụng mã giảm giá cho sản phẩm thành công", "success");
    } catch (error) {
      console.error("Error applying product discount:", error);
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

  const handleProceedToCheckout = async () => {
    if (!cart || cart.products.length === 0) {
      addToast("Giỏ hàng của bạn đang trống.", "warning");
      return;
    }

    try {
      const cartProducts = cart.products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));

      const response = await apiClient.post("/cart/check-stock", {
        products: cartProducts,
      });

      if (response.data.message === "Tất cả sản phẩm có sẵn trong kho.") {
        navigate("/checkout", { state: { cartItems: cart.products } });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const nameOfOutOfStockItems = error.response.data.nameOfOutOfStockItems;
        if (nameOfOutOfStockItems && nameOfOutOfStockItems.length > 0) {
          addToast(
            `Các sản phẩm ${nameOfOutOfStockItems.join(", ")} đã hết hàng.`,
            "danger"
          );
        }
      } else {
        addToast("Lỗi khi kiểm tra tồn kho. Vui lòng thử lại sau.", "danger");
      }
    }
  };

  const getTotalDiscount = () => {
    if (!cart || !cart.products) return 0;
    let totalDiscount = 0;

    totalDiscount += cart.products.reduce((total, item) => {
      if (item.discount) {
        const discountAmount = item.discount.isPercentage
          ? (item.price * item.discount.value * item.quantity) / 100
          : item.discount.value * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);

    if (cart.discountCode) {
      const cartTotalBeforeDiscount = cart.products.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);

      const cartDiscountAmount = cart.discountCode.isPercentage
        ? (cartTotalBeforeDiscount * cart.discountCode.value) / 100
        : cart.discountCode.value;
      totalDiscount += cartDiscountAmount;
    }

    return totalDiscount;
  };

  return (
    <div className="cart-page">
      <Container className="cart-container my-5">
        <Row className="cart-row">
          <Col xl={8} className="cart-col">
            {loading ? (
              <div className="cart-loading text-center" id="loading">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : !cart || cart.products.length === 0 ? (
              <div className="cart-empty text-center" id="empty-cart">
                <Alert variant="info" className="cart-empty-alert">
                  Giỏ hàng của bạn đang trống.
                </Alert>
                <Button
                  variant="primary"
                  className="cart-continue-button"
                  onClick={() => navigate("/product")}
                >
                  <FaArrowLeft /> Tiếp tục mua sắm
                </Button>
              </div>
            ) : (
              <>
                <h3 className="cart-heading">Giỏ hàng của bạn</h3>
                {cart.products.map((item) => {
                  return (
                    <Card
                      border="light"
                      className="cart-product-card"
                      key={item._id}
                    >
                      <Card.Body className="cart-product-card-body">
                        <Row className="cart-product-row">
                          <Col
                            md={3}
                            sm={4}
                            xs={5}
                            className="cart-product-col"
                          >
                            <Image
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
                              fluid
                              rounded
                              className="cart-product-image"
                            />
                          </Col>
                          <Col
                            md={3}
                            sm={8}
                            xs={7}
                            className="cart-product-col"
                          >
                            <h5 className="cart-product-name">
                              {item.product.name}
                            </h5>
                            <p className="cart-product-price">
                              {formatPrice(item.price)}
                            </p>
                            {item.discount && (
                              <Badge
                                bg="success"
                                className="cart-product-discount-badge"
                              >
                                Giảm {item.discount.value}
                                {item.discount.isPercentage ? "%" : "₫"}
                              </Badge>
                            )}
                          </Col>
                          <Col md={3} className="cart-product-col">
                            <div className="cart-quantity-container">
                              <button
                                className="cart-quantity-button"
                                onClick={() =>
                                  updateQuantity(item.product._id, -1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <p className="cart-quantity-display">
                                {item.quantity}
                              </p>
                              <button
                                className="cart-quantity-button"
                                onClick={() =>
                                  updateQuantity(item.product._id, 1)
                                }
                                disabled={item.quantity >= item.product.stock}
                              >
                                +
                              </button>
                            </div>
                          </Col>
                          <Col md={2} className="cart-product-col">
                            <h5 className="cart-product-totalprice">
                              {formatPrice(item.totalPrice)}
                            </h5>
                          </Col>
                          <Col md={1} className="cart-product-col">
                            <Button
                              variant="danger"
                              size="sm"
                              className="cart-remove-button"
                              onClick={() => removeItem(item.product._id)}
                            >
                              <FaTrashAlt />
                            </Button>
                          </Col>
                        </Row>
                        <Row className="cart-product-discount-row">
                          <Col md={6} sm={12}>
                            {item.discount ? (
                              <div className="cart-product-discount-applied">
                                <Badge
                                  bg="info"
                                  className="cart-product-discount-code-badge"
                                >
                                  Mã giảm giá: {item.discount.code}
                                </Badge>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="cart-product-discount-remove-button"
                                  onClick={() =>
                                    removeProductDiscount(item.product._id)
                                  }
                                >
                                  Xóa
                                </Button>
                              </div>
                            ) : (
                              <InputGroup className="cart-product-discount-group">
                                <Form.Control
                                  type="text"
                                  placeholder="Nhập mã giảm giá"
                                  className="cart-product-discount-input"
                                  value={
                                    productDiscountCodes[item.product._id] || ""
                                  }
                                  onChange={(e) =>
                                    setProductDiscountCodes({
                                      ...productDiscountCodes,
                                      [item.product._id]: e.target.value,
                                    })
                                  }
                                />
                                <Button
                                  variant="success"
                                  className="cart-product-discount-apply-button"
                                  onClick={() =>
                                    applyProductDiscount(
                                      item.product._id,
                                      productDiscountCodes[item.product._id]
                                    )
                                  }
                                >
                                  Áp dụng
                                </Button>
                              </InputGroup>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })}
              </>
            )}
          </Col>

          <Col xl={4} className="cart-col">
            <Card border="light" className="cart-summary-card">
              <Card.Header className="cart-summary-header">
                <h4 className="cart-summary-heading">Tóm tắt đơn hàng</h4>
              </Card.Header>
              <Card.Body className="cart-summary-body">
                {cart && cart.products.length > 0 && (
                  <>
                    <Row className="cart-summary-row">
                      <Col className="cart-summary-label">Thành tiền:</Col>
                      <Col className="cart-summary-value text-end">
                        {formatPrice(getTotalPrice())}
                      </Col>
                    </Row>
                    <Row className="cart-summary-row">
                      <Col className="cart-summary-label">Giảm giá:</Col>
                      <Col className="cart-summary-value text-end">
                        {formatPrice(getTotalDiscount())}
                      </Col>
                    </Row>
                    <hr />
                    <Row className="cart-summary-row cart-summary-total-row">
                      <Col className="cart-summary-total-label">
                        <strong>Tổng tiền thanh toán:</strong>
                      </Col>
                      <Col className="cart-summary-total-value text-end">
                        <strong>
                          {formatPrice(getTotalPrice() - getTotalDiscount())}
                        </strong>
                      </Col>
                    </Row>
                    <Form.Group className="cart-discount-section">
                      <Form.Label className="cart-discount-label">
                        Mã giảm giá toàn bộ giỏ hàng
                      </Form.Label>
                      <InputGroup className="cart-discount-input-group">
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          className="cart-discount-input"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button
                          variant="primary"
                          className="cart-discount-apply-button"
                          onClick={applyCartDiscount}
                        >
                          Áp dụng
                        </Button>
                      </InputGroup>
                      {cart.discountCode && (
                        <div className="cart-discount-applied">
                          <Badge
                            bg="success"
                            className="cart-discount-code-badge me-2"
                          >
                            {cart.discountCode.code}
                          </Badge>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="cart-discount-remove-button"
                            onClick={removeCartDiscount}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                      {discountError && (
                        <Alert variant="danger" className="cart-discount-error">
                          {discountError}
                        </Alert>
                      )}
                    </Form.Group>
                    <div className="cart-checkout-section">
                      <Button
                        variant="success"
                        size="lg"
                        className="cart-checkout-button"
                        onClick={handleProceedToCheckout}
                      >
                        <FaCartArrowDown className="cart-checkout-icon" />
                        Thanh toán
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CartPage;
