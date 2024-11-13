import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("zalopay");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Lấy thông tin người dùng và địa chỉ mặc định
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        const user = response.data;
        setUserInfo(user);

        // Đặt địa chỉ mặc định (nếu có)
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
    if (location.state && location.state.cartItems) {
      setCartItems(location.state.cartItems);
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (localCart.length > 0) {
        setCartItems(localCart);
      } else {
        alert(
          "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng."
        );
        navigate("/cart");
      }
    }
  }, [location.state, navigate]);

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

  const formatPrice = (price) =>
    price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddress || cartItems.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin và giỏ hàng.");
      return;
    }

    const shippingAddress = {
      name: userInfo.name,
      phone: userInfo.phone,
      address: `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
    };

    const orderData = {
      shippingAddress,
      paymentMethod,
      products: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };
    console.log("Order data:", orderData);

    try {
      const response = await apiClient.post("/order", orderData);
      if (paymentMethod === "zalopay") {
        const { orderUrl } = response.data;
        window.location.href = orderUrl;
      } else {
        navigate("/order-success");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
    }
  };

  const handleAddNewAddress = async () => {
    try {
      const updatedAddresses = [...userInfo.addresses, newAddress];
      await apiClient.put("/user/profile", { addresses: updatedAddresses });
      window.location.reload(); // Reload để cập nhật danh sách địa chỉ mới
    } catch (error) {
      console.error("Error adding new address:", error);
      alert("Lỗi khi thêm địa chỉ mới. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Thanh toán</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Thông tin giao hàng</h4>
          {userInfo && selectedAddress && (
            <>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  name="name"
                  value={userInfo.name}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={userInfo.phone}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ giao hàng</label>
                <input
                  name="address"
                  value={`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}
                  className="form-control"
                  readOnly
                />
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="btn btn-link"
                >
                  Thay đổi địa chỉ mặc định
                </button>
              </div>
              {isEditingAddress && (
                <div className="form-group">
                  <label>Chọn địa chỉ khác</label>
                  <select
                    value={selectedAddress._id}
                    onChange={(e) =>
                      setSelectedAddress(
                        userInfo.addresses.find(
                          (addr) => addr._id === e.target.value
                        )
                      )
                    }
                    className="form-control"
                  >
                    {userInfo.addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="btn btn-link"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setIsAddingNewAddress(true)}
                    className="btn btn-link"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>
              )}
              {isAddingNewAddress && (
                <div className="form-group mt-3">
                  <label>Thêm địa chỉ mới</label>
                  <input
                    placeholder="Tỉnh/Thành phố"
                    value={newAddress.province}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, province: e.target.value })
                    }
                    className="form-control mb-2"
                  />
                  <input
                    placeholder="Quận/Huyện"
                    value={newAddress.district}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, district: e.target.value })
                    }
                    className="form-control mb-2"
                  />
                  <input
                    placeholder="Phường/Xã"
                    value={newAddress.ward}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, ward: e.target.value })
                    }
                    className="form-control mb-2"
                  />
                  <input
                    placeholder="Thông tin nhỏ hơn (số nhà, tên đường, ...)"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="form-control mb-2"
                  />
                  <button
                    onClick={handleAddNewAddress}
                    className="btn btn-primary"
                  >
                    Lưu địa chỉ mới
                  </button>
                  <button
                    onClick={() => setIsAddingNewAddress(false)}
                    className="btn btn-link"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="form-control"
            >
              <option value="zalopay">ZaloPay</option>
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handlePlaceOrder}>
            Thanh toán
          </button>
        </div>

        <div className="col-md-6">
          <h4>Thông tin đơn hàng</h4>
          <div className="order-items">
            {cartItems.map((item) => (
              <div className="order-item" key={item.product._id}>
                <div>{item.product.title}</div>
                <div>
                  {item.quantity} x {formatPrice(item.product.price)}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Tổng tiền: {formatPrice(getTotalPrice())}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
