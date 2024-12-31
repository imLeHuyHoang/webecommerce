// src/components/Profile/Profile.jsx

import React, { useEffect, useState } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import apiClient from "../../utils/api-client";

import OrderStatus from "./OrderStatus";
import UserInfo from "./UserInfo";
import Addresses from "./Addresses";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./Profile.css";

const Profile = () => {
  const { user, loadingUser, updateUser } = useUserProfile();
  const [orderStatusCounts, setOrderStatusCounts] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const ordersResponse = await apiClient.get("/order/status-counts");
        setOrderStatusCounts(ordersResponse.data);
      } catch (error) {
        console.error("Error fetching order status:", error);
        setToastMessage("Lỗi khi tải thông tin đơn hàng.");
        setShowToast(true);
      }
    };
    fetchOrderStatus();
  }, []);

  // Hàm cập nhật USER
  const handleSaveUser = async (updatedUserData) => {
    try {
      await updateUser(updatedUserData);
      setToastMessage("Cập nhật thông tin thành công.");
      setShowToast(true);
    } catch (error) {
      console.error("Update user error:", error);
      setToastMessage("Lỗi khi cập nhật thông tin.");
      setShowToast(true);
    }
  };

  // Hàm cập nhật ADDRESS
  const handleSaveAddresses = async (updatedAddresses) => {
    try {
      await updateUser({ addresses: updatedAddresses });
      setToastMessage("Cập nhật địa chỉ thành công.");
      setShowToast(true);
    } catch (error) {
      console.error("Update addresses error:", error);
      setToastMessage("Lỗi khi cập nhật địa chỉ.");
      setShowToast(true);
    }
  };

  if (loadingUser || !user) {
    return <p className="text-center mt-5">Đang tải thông tin người dùng...</p>;
  }

  return (
    <div className="profile-page-section bg-light py-5">
      <div className="profile-page-container bg-white p-5 rounded shadow-sm">
        {/* Welcome Section */}
        <div className="profile-page-welcome mb-4 text-center">
          <h1 className="profile-page-title h2 font-weight-bold">
            Xin chào, {user?.name}!
          </h1>
          <p className="profile-page-subtitle text-muted">
            Rất vui khi bạn đã quay lại.
          </p>
        </div>

        <div className="profile-page-new-layout">
          {/* Dòng 1: Tình trạng đơn hàng */}
          <div className="profile-page-row row-order-status">
            <OrderStatus orderStatusCounts={orderStatusCounts} />
          </div>

          {/* Dòng 2: Thông tin người dùng + Địa chỉ */}
          <div className="profile-page-row row-user-info-address">
            <div className="profile-page-col user-info-col">
              <UserInfo
                user={user}
                onSaveUser={handleSaveUser}
                loading={loadingUser}
              />
            </div>
            <div className="profile-page-col addresses-col">
              <Addresses
                addresses={user.addresses}
                onSaveAddresses={handleSaveAddresses}
                loading={loadingUser}
              />
            </div>
          </div>
        </div>

        <ToastNotification
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default Profile;
