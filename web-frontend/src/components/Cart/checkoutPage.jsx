import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import UserInfoForm from "../Profile/UserInforForm";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false); // New state
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("zalopay");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null); // State to store cart data
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    // Fetch user data and default address
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        const user = response.data;
        setUserInfo(user);

        // Set default address
        const defaultAddress =
          user.addresses.find((addr) => addr.default) || user.addresses[0];
        setSelectedAddress(defaultAddress);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Fetch cart data
    const fetchCartData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/cart");
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Lỗi khi tải dữ liệu giỏ hàng. Vui lòng thử lại.");
        navigate("/cart"); // Redirect to cart page if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [navigate]);

  // Function to calculate total price before discounts
  const getTotalPriceBeforeDiscount = () => {
    if (!cart || !cart.products) return 0;
    return cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Function to calculate total discount
  const getTotalDiscount = () => {
    if (!cart || !cart.products) return 0;
    let totalDiscount = 0;

    // Product-level discounts
    totalDiscount += cart.products.reduce((total, item) => {
      if (item.discount) {
        const discountAmount = item.discount.isPercentage
          ? (item.price * item.discount.value * item.quantity) / 100
          : item.discount.value * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);

    // Cart-level discount
    if (cart.discountCode) {
      const cartTotalAfterProductDiscounts =
        getTotalPriceBeforeDiscount() - totalDiscount;
      const cartDiscountAmount = cart.discountCode.isPercentage
        ? (cartTotalAfterProductDiscounts * cart.discountCode.value) / 100
        : cart.discountCode.value;
      totalDiscount += cartDiscountAmount;
    }

    return totalDiscount;
  };

  // Function to calculate total amount after discounts
  const getTotalAmount = () => {
    return getTotalPriceBeforeDiscount() - getTotalDiscount();
  };

  const formatPrice = (price) =>
    price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !cart || cart.products.length === 0) {
      alert(
        "Bạn chưa cập nhật thông tin cá nhân, hãy cập nhật thông tin của mình."
      );
      return;
    }

    const shippingAddress = {
      name: userInfo.name,
      phone: Array.isArray(userInfo.phone) ? userInfo.phone[0] : userInfo.phone,
      address: `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
    };

    const orderData = {
      shippingAddress,
      paymentMethod,
      products: cart.products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount ? item.discount._id : null,
      })),
      cartDiscountCode: cart.discountCode ? cart.discountCode._id : null,
    };

    try {
      const response = await apiClient.post("/order/create", orderData);
      if (paymentMethod === "zalopay") {
        const { orderUrl } = response.data;
        window.location.href = orderUrl;
      } else {
        toast.success("Đặt hàng thành công!", {
          onClose: () => {
            navigate("/my-order");
            window.location.reload();
          },
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      console.log(orderData);
      toast.error("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
    }
  };

  const handleAddNewAddress = async () => {
    try {
      const updatedAddresses = [...userInfo.addresses, newAddress];
      const response = await apiClient.put("/user/profile", {
        addresses: updatedAddresses,
      });
      setUserInfo(response.data);
      setSelectedAddress(newAddress);
      setIsAddingNewAddress(false);
      setIsEditingAddress(false);
    } catch (error) {
      console.error("Error adding new address:", error);
      alert("Lỗi khi thêm địa chỉ mới. Vui lòng thử lại.");
    }
  };

  const handleUserInfoSave = (updatedUserInfo) => {
    setUserInfo(updatedUserInfo);
    setIsEditingUserInfo(false);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Thanh toán</h2>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <section className="container-checkout">
      <div className="container mt-5">
        <ToastContainer />
        <div className="row">
          <div className="col-md-4">
            <h2 className="mb-4 ">Khách Hàng</h2>
            <div className="card mb-4 user-information">
              <div className="card-body">
                {userInfo && (
                  <>
                    {!userInfo.name || !userInfo.phone || isEditingUserInfo ? (
                      // Show user info form if missing data or editing
                      <div>
                        <p>
                          Vui lòng bổ sung thông tin để tiếp tục thanh toán.
                        </p>
                        <UserInfoForm
                          initialData={userInfo}
                          onSave={handleUserInfoSave}
                        />
                      </div>
                    ) : (
                      // Display user info
                      <>
                        <p className="card-text ">
                          <strong className="user-name">Họ và tên:</strong>{" "}
                          {userInfo.name}
                        </p>
                        <p className="card-text">
                          <strong className="user-phone">Số điện thoại:</strong>{" "}
                          {userInfo.phone}
                        </p>
                        <button
                          className="btn btn-link"
                          onClick={() => setIsEditingUserInfo(true)}
                        >
                          Chỉnh, sửa thông tin
                        </button>
                      </>
                    )}
                  </>
                )}
                {selectedAddress ? (
                  <>
                    <p className="card-text">
                      <strong className="user-address">Địa chỉ:</strong>{" "}
                      {`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}
                    </p>
                    <button
                      className="btn btn-primary "
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                    >
                      Thay đổi địa chỉ
                    </button>
                    {isEditingAddress && (
                      <div className="mb-3">
                        <label className="form-label">Chọn địa chỉ khác</label>
                        <select
                          className="form-select"
                          value={selectedAddress._id}
                          onChange={(e) =>
                            setSelectedAddress(
                              userInfo.addresses.find(
                                (addr) => addr._id === e.target.value
                              )
                            )
                          }
                        >
                          {userInfo.addresses.map((address) => (
                            <option key={address._id} value={address._id}>
                              {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-secondary mt-2"
                          onClick={() => setIsAddingNewAddress(true)}
                        >
                          Thêm địa chỉ mới
                        </button>
                        {isAddingNewAddress && (
                          <div id="newAddressForm" className="mt-3">
                            <div className="mb-3">
                              <label className="form-label">
                                Tỉnh/Thành phố
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={newAddress.province}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    province: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Quận/Huyện</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newAddress.district}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    district: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Phường/Xã</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newAddress.ward}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    ward: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">
                                Số nhà, tên đường
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={newAddress.street}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    street: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <button
                              className="btn btn-primary"
                              onClick={handleAddNewAddress}
                            >
                              Lưu địa chỉ mới
                            </button>
                            <button
                              className="btn btn-link"
                              onClick={() => setIsAddingNewAddress(false)}
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // If no address is selected
                  <>
                    <p>Bạn chưa có địa chỉ giao hàng.</p>
                    <button
                      className="btn btn-secondary mt-2"
                      onClick={() => setIsAddingNewAddress(true)}
                    >
                      Thêm địa chỉ mới
                    </button>
                    {isAddingNewAddress && (
                      <div id="newAddressForm" className="mt-3">
                        <div className="mb-3">
                          <label className="form-label">Tỉnh/Thành phố</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.province}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                province: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Quận/Huyện</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.district}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                district: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Phường/Xã</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.ward}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                ward: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Số nhà, tên đường
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.street}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                street: e.target.value,
                              })
                            }
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={handleAddNewAddress}
                        >
                          Lưu địa chỉ mới
                        </button>
                        <button
                          className="btn btn-link"
                          onClick={() => setIsAddingNewAddress(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <h2 className="mb-4">Phương thức thanh toán</h2>
            <div className="card mb-4 pay-information">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Phương thức thanh toán</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option className="zalopay" value="zalopay">
                      ZaloPay
                    </option>
                    <option className="cod" value="cod">
                      Thanh toán khi nhận hàng
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <h2 className="mb-4">Thông tin đơn hàng</h2>
            <div className="card mb-4 card-information ">
              <div className="card-body">
                {cart && cart.products.length > 0 ? (
                  <>
                    <div className="row mb-3 infor">
                      <div className="col-4 text-name-product ">
                        <strong className="text-name-product">
                          Tên sản phẩm
                        </strong>
                      </div>
                      <div className="col-2 text-quantity">
                        <strong className="text-quantity">Số lượng</strong>
                      </div>
                      <div className="col-3 text-price">
                        <strong className="text-price">Đơn giá</strong>
                      </div>
                      <div className="col-3 text-total ">
                        <strong className="text-total">Thành tiền</strong>
                      </div>
                    </div>
                    {cart.products.map((item) => {
                      const discountAmount = item.discount
                        ? item.discount.isPercentage
                          ? (item.price * item.discount.value * item.quantity) /
                            100
                          : item.discount.value * item.quantity
                        : 0;
                      return (
                        <div
                          className="row mb-3 product-infor"
                          key={item.product._id}
                        >
                          <div className="col-4 product-name">
                            • {item.product.name}
                          </div>
                          <div className="col-2 product-quantity">
                            {item.quantity}
                          </div>
                          <div className="col-3 product-price">
                            {formatPrice(item.price)}
                          </div>
                          <div className="col-3 product-total">
                            {formatPrice(
                              item.price * item.quantity - discountAmount
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p>Giỏ hàng của bạn đang trống.</p>
                )}
              </div>
            </div>

            <h2 className="mb-4">Tổng cộng đơn hàng</h2>
            <div className="card mb-4 total">
              <div className="card-body">
                <p className="card-text">
                  <strong>Tổng tiền hàng:</strong>{" "}
                  {formatPrice(getTotalPriceBeforeDiscount())}
                </p>
                <p className="card-text">
                  <strong>Tổng giảm giá:</strong>{" "}
                  {formatPrice(getTotalDiscount())}
                </p>
                <p className="card-text">
                  <strong>Tổng tiền thanh toán:</strong>{" "}
                  {formatPrice(getTotalAmount())}
                </p>
              </div>
            </div>

            <button
              className="btn btn-success btn-lg w-100"
              onClick={handlePlaceOrder}
              disabled={
                !userInfo ||
                !userInfo.name ||
                !userInfo.phone ||
                !selectedAddress ||
                !cart ||
                cart.products.length === 0
              }
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
