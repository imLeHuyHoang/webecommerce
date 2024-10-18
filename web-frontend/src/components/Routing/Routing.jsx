import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "../Home/HomePage.jsx";
import ProductPage from "../Products/ProductPage";
import SingleProductPage from "../Products/SingleProduct/SingleProductPage";
import CartPage from "../Cart/CartPage";
import MyOrders from "../MyOrder/Myorder.jsx";
import LoginPage from "../LoginPage/LoginPage.jsx";
import SignUpPage from "../SignupPage/SignupPage.jsx";
import AboutUs from "../AboutUs/Aboutus.jsx"; // Import trang About Us
import { AuthProvider } from "../../Services/authContext";
import Logout from "../LogOut/LogOut.jsx";
function Routing() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/about" element={<AboutUs />} />{" "}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<SingleProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/my-order" element={<MyOrders />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </AuthProvider>
  );
}

export default Routing;
