// Routing.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../Home/HomePage.jsx";
import ProductPage from "../Products/ProductPage";
import SingleProductPage from "../Products/SingleProduct/SingleProductPage";
import CartPage from "../Cart/CartPage";
import MyOrders from "../MyOrder/MyOrder.jsx";
import LoginPage from "../LoginPage/LoginPage.jsx";
import SignUpPage from "../SignupPage/SignupPage.jsx";
import Logout from "../LogOut/LogOut.jsx";
import Profile from "../Profile/Profile.jsx";
import Dashboard from "../Admin/Dashboard.jsx";
import UserManagement from "../Admin/UserManagement.jsx";
import ProductManagement from "../Admin/ProductManagement.jsx";
import OrderManagement from "../Admin/OrderManagement.jsx";
import AdminLogin from "../Admin/adminlogin/AdminLogin";
import AdminRoute from "../Admin/AdminRoute.jsx";
import CheckoutPage from "../Cart/checkoutPage.jsx";
import PaymentResult from "../PaymentResult.jsx";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/product/:id" element={<SingleProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/my-order" element={<MyOrders />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment-result" element={<PaymentResult />} />

      {/* Các route cho admin */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="usermanagement" element={<UserManagement />} />
        <Route path="productmanagement" element={<ProductManagement />} />
        <Route path="ordermanagement" element={<OrderManagement />} />
      </Route>
    </Routes>
  );
}

export default Routing;
