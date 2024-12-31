// src/components/Checkout/CheckoutPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api-client";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useCart } from "../../context/CartContext";
import { ToastContext } from "../ToastNotification/ToastContext";
import UserInfoSection from "./UserInfoSection";
import AddressSection from "./AddressSection";
import PaymentMethodSection from "./PaymentMethodSection";
import OrderItemsList from "./OrderItemList";
import OrderTotals from "./OrderTotals";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Checkout.css";

const CheckoutPage = () => {
  const { user, updateUser, loadingUser } = useUserProfile();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const { updateCart } = useCart();

  const { addToast } = useContext(ToastContext);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // formData cho user info trong checkout
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: "",
    phone: "",
    gender: "",
  });

  // Address state
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });

  // user info editing
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);

  // payment method
  const [paymentMethod, setPaymentMethod] = useState("zalopay");

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/cart");
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        addToast("Lỗi khi tải dữ liệu giỏ hàng. Vui lòng thử lại.", "danger");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [navigate, addToast]);

  // Đồng bộ user => checkoutFormData + default address
  useEffect(() => {
    if (user) {
      setCheckoutFormData({
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddress =
          user.addresses.find((addr) => addr.default) || user.addresses[0];
        setSelectedAddress(defaultAddress);
      }
    }
  }, [user]);

  // Hàm xử lý user info submit
  const handleUserInfoSubmit = async (updatedUserInfo) => {
    try {
      setLoading(true);
      await updateUser(updatedUserInfo);
      setCheckoutFormData({
        name: updatedUserInfo.name,
        phone: updatedUserInfo.phone,
        gender: updatedUserInfo.gender,
      });
      setIsEditingUserInfo(false);
      addToast("Thông tin người dùng đã được cập nhật thành công!", "success");
    } catch (error) {
      console.error("Error updating user info:", error);
      addToast(
        "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm add new address
  const handleAddNewAddress = async () => {
    try {
      if (!user) return;
      const updatedAddresses = [...(user.addresses || []), newAddress];
      await updateUser({ addresses: updatedAddresses });
      setSelectedAddress(newAddress);
      setIsAddingNewAddress(false);
      setIsEditingAddress(false);
      addToast("Đã thêm địa chỉ mới!", "success");
    } catch (error) {
      console.error("Error adding new address:", error);
      addToast("Lỗi khi thêm địa chỉ mới. Vui lòng thử lại.", "danger");
    }
  };

  // Tính toán giỏ hàng
  const getTotalPriceBeforeDiscount = () => {
    if (!cart || !cart.products) return 0;
    return cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
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

    // Discount for entire cart
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

  const getTotalAmount = () => {
    return getTotalPriceBeforeDiscount() - getTotalDiscount();
  };

  const formatPrice = (price) =>
    price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  // Đặt hàng
  const handlePlaceOrder = async () => {
    if (
      !selectedAddress ||
      !cart ||
      !cart.products ||
      cart.products.length === 0
    ) {
      addToast("Vui lòng cập nhật đầy đủ thông tin để thanh toán.", "warning");
      return;
    }

    const shippingAddress = {
      name: user.name,
      phone: user.phone,
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
      setLoading(true);
      const response = await apiClient.post("/order/create", orderData);

      // Thanh toán ZaloPay => chuyển đến cổng thanh toán
      if (paymentMethod === "zalopay") {
        const { orderUrl } = response.data;
        window.location.href = orderUrl;
      } else {
        setCart(null);
        updateCart();

        addToast(
          "Đặt hàng thành công, vui lòng kiểm tra trang Đơn hàng của tôi.",
          "success"
        );
        setTimeout(() => {
          navigate("/my-order");
        }, 3000);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      addToast(
        "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser || loading) {
    return (
      <div className="checkout-page-loading-container container mt-4">
        <h2 className="checkout-page-loading-title">Thanh toán</h2>
        <p className="checkout-page-loading-text">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <section className="checkout-page-section container-checkout">
      <div className="checkout-page-container container mt-5">
        <div className="checkout-page-row row">
          <div className="checkout-page-col-left col-md-4">
            <h2 className="checkout-page-heading mb-4">Khách Hàng</h2>
            <UserInfoSection
              userInfo={user}
              checkoutFormData={checkoutFormData}
              setCheckoutFormData={setCheckoutFormData}
              isEditingUserInfo={isEditingUserInfo}
              setIsEditingUserInfo={setIsEditingUserInfo}
              onSubmit={handleUserInfoSubmit}
            />
            <AddressSection
              userInfo={user}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              isEditingAddress={isEditingAddress}
              setIsEditingAddress={setIsEditingAddress}
              isAddingNewAddress={isAddingNewAddress}
              setIsAddingNewAddress={setIsAddingNewAddress}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              handleAddNewAddress={handleAddNewAddress}
            />
            <h2 className="checkout-page-heading mb-4">
              Phương thức thanh toán
            </h2>
            <PaymentMethodSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
          <div className="checkout-page-col-right col-md-8">
            <h2 className="checkout-page-heading mb-4">Thông tin đơn hàng</h2>
            <OrderItemsList cart={cart} formatPrice={formatPrice} />
            <h2 className="checkout-page-heading mb-4">Tổng cộng đơn hàng</h2>
            <OrderTotals
              getTotalPriceBeforeDiscount={getTotalPriceBeforeDiscount}
              getTotalDiscount={getTotalDiscount}
              getTotalAmount={getTotalAmount}
              formatPrice={formatPrice}
            />
            <button
              className="checkout-page-placeorder-btn btn btn-success btn-lg w-100"
              onClick={handlePlaceOrder}
              disabled={
                !user ||
                !user.name ||
                !user.phone ||
                !selectedAddress ||
                !cart ||
                !cart.products ||
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
