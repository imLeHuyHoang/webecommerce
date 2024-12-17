import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import UserInfoSection from "./UserInfoSection";
import AddressSection from "./AddressSection";
import PaymentMethodSection from "./PaymentMethodSection";
import OrderItemsList from "./OrderItemList";
import OrderTotals from "./OrderTotals";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Checkout.css";

const CheckoutPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("zalopay");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // formData cho user info trong checkout
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: "",
    phone: "",
    gender: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        const user = response.data;
        setUserInfo(user);
        setCheckoutFormData({
          name: user.name || "",
          phone: user.phone || "",
          gender: user.gender || "",
        });

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
    const fetchCartData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/cart");
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Lỗi khi tải dữ liệu giỏ hàng. Vui lòng thử lại.");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [navigate]);

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

    // Discount per product
    totalDiscount += cart.products.reduce((total, item) => {
      if (item.discount) {
        const discountAmount = item.discount.isPercentage
          ? (item.price * item.discount.value * item.quantity) / 100
          : item.discount.value * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);

    // Discount for the entire cart
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

  const handleUserInfoSubmit = async (updatedUserInfo) => {
    try {
      setLoading(true);
      const response = await apiClient.put("/user/profile", {
        name: updatedUserInfo.name,
        phone: updatedUserInfo.phone,
        gender: updatedUserInfo.gender,
      });
      setUserInfo(response.data);
      setCheckoutFormData({
        name: response.data.name || "",
        phone: response.data.phone || "",
        gender: response.data.gender || "",
      });
      setIsEditingUserInfo(false);
      toast.success("Thông tin người dùng đã được cập nhật thành công!");
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <ToastContainer />
        <div className="checkout-page-row row">
          <div className="checkout-page-col-left col-md-4">
            <h2 className="checkout-page-heading mb-4">Khách Hàng</h2>
            <UserInfoSection
              userInfo={userInfo}
              checkoutFormData={checkoutFormData}
              setCheckoutFormData={setCheckoutFormData}
              isEditingUserInfo={isEditingUserInfo}
              setIsEditingUserInfo={setIsEditingUserInfo}
              onSubmit={handleUserInfoSubmit}
            />
            <AddressSection
              userInfo={userInfo}
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
