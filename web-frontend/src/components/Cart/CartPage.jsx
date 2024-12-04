// src/components/CartPage/CartPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api-client";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaCartArrowDown,
} from "react-icons/fa";
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
  // Khởi tạo cart với products là mảng rỗng để tránh lỗi
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
  }, [auth.user]); // Loại bỏ addToast khỏi dependency array

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

  const handleProceedToCheckout = async () => {
    if (!cart || cart.products.length === 0) {
      addToast("Giỏ hàng của bạn đang trống.", "warning");
      return;
    }

    try {
      // Lấy danh sách sản phẩm và số lượng trong giỏ
      const cartProducts = cart.products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));

      // Kiểm tra tồn kho
      const response = await apiClient.post("/cart/check-stock", {
        products: cartProducts,
      });

      if (response.data.message === "Tất cả sản phẩm có sẵn trong kho.") {
        // Nếu tất cả sản phẩm có sẵn trong kho, chuyển hướng đến trang checkout
        navigate("/checkout", { state: { cartItems: cart.products } });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const outOfStockItems = error.response.data.outOfStockItems;
        const nameOfOutOfStockItems = error.response.data.nameOfOutOfStockItems;
        if (outOfStockItems.length > 0) {
          // Hiển thị thông báo lỗi nếu có sản phẩm hết hàng
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
    <div className="cartpage">
      <Container className="my-5">
        <Row>
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <Col xl={8}>
            {loading ? (
              <div className="text-center" id="loading">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : !cart || cart.products.length === 0 ? (
              <div className="text-center" id="empty-cart">
                <Alert variant="info">Giỏ hàng của bạn đang trống.</Alert>
                <Button variant="primary" onClick={() => navigate("/product")}>
                  <FaArrowLeft /> Tiếp tục mua sắm
                </Button>
              </div>
            ) : (
              <>
                <h3 className="mb-4">Giỏ hàng của bạn</h3>
                {cart.products.map((item) => {
                  const discountAmount = item.discount
                    ? item.discount.isPercentage
                      ? (item.price * item.discount.value * item.quantity) / 100
                      : item.discount.value * item.quantity
                    : 0;
                  return (
                    <Card
                      border="light"
                      className="mb-4 shadow-sm"
                      key={item._id}
                    >
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={3} sm={4} xs={5}>
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
                              className="product-image"
                            />
                          </Col>
                          <Col md={3} sm={8} xs={7}>
                            <h5 className="product-name">
                              {item.product.name}
                            </h5>
                            <p className="text-muted mb-1">
                              {formatPrice(item.price)}
                            </p>
                            {item.discount && (
                              <Badge bg="success">
                                Giảm {item.discount.value}
                                {item.discount.isPercentage ? "%" : "₫"}
                              </Badge>
                            )}
                          </Col>
                          <Col md={3} className="d-none d-md-block">
                            <InputGroup className="quantity">
                              {/* Nút giảm */}
                              <button
                                className=" button-minus"
                                onClick={() =>
                                  updateQuantity(item.product._id, -1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>

                              {/* Ô input hiển thị số lượng */}
                              <p className="text-quantity">{item.quantity}</p>

                              {/* Nút tăng */}
                              <button
                                className=" button-plus"
                                onClick={() =>
                                  updateQuantity(item.product._id, 1)
                                }
                                disabled={item.quantity >= item.product.stock}
                              >
                                +
                              </button>
                            </InputGroup>
                          </Col>

                          <Col md={2} className="d-none d-md-block text-end">
                            <h5>{formatPrice(item.totalPrice)}</h5>
                          </Col>
                          <Col md={1} className="text-end">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeItem(item.product._id)}
                            >
                              <FaTrashAlt />
                            </Button>
                          </Col>
                        </Row>
                        {/* Tùy chọn giảm giá sản phẩm */}
                        <Row className="mt-3">
                          <Col md={6} sm={12}>
                            {item.discount ? (
                              <div className="d-flex align-items-center">
                                <Badge bg="info" className="me-2">
                                  Mã giảm giá: {item.discount.code}
                                </Badge>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    removeProductDiscount(item.product._id)
                                  }
                                >
                                  Xóa
                                </Button>
                              </div>
                            ) : (
                              <InputGroup className="mb-3">
                                <Form.Control
                                  type="text"
                                  placeholder="Nhập mã giảm giá"
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

          {/* Tóm tắt đơn hàng */}
          <Col xl={4}>
            <Card border="light" className="shadow-sm">
              <Card.Header className="bg-transparent border-bottom">
                <h4>Tóm tắt đơn hàng</h4>
              </Card.Header>
              <Card.Body>
                {cart && cart.products.length > 0 && (
                  <>
                    <Row className="mb-2">
                      <Col>Thành tiền:</Col>
                      <Col className="text-end">
                        {formatPrice(getTotalPrice())}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>Giảm giá:</Col>
                      <Col className="text-end">
                        {formatPrice(getTotalDiscount())}
                      </Col>
                    </Row>
                    <hr />
                    <Row className="mb-3">
                      <Col>
                        <strong>Tổng tiền thanh toán:</strong>
                      </Col>
                      <Col className="text-end">
                        <strong>
                          {formatPrice(getTotalPrice() - getTotalDiscount())}
                        </strong>
                      </Col>
                    </Row>
                    {/* Mã giảm giá toàn bộ giỏ hàng */}
                    <Form.Group className="mb-3">
                      <Form.Label>Mã giảm giá toàn bộ giỏ hàng</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button variant="primary" onClick={applyCartDiscount}>
                          Áp dụng
                        </Button>
                      </InputGroup>
                      {cart.discountCode && (
                        <div className="mt-2 d-flex align-items-center">
                          <Badge bg="success" className="me-2">
                            {cart.discountCode.code}
                          </Badge>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={removeCartDiscount}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                      {discountError && (
                        <Alert variant="danger" className="mt-2">
                          {discountError}
                        </Alert>
                      )}
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleProceedToCheckout}
                      >
                        <FaCartArrowDown className="me-2" />
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
