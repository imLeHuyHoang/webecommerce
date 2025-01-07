// src/components/Profile/UserInfo.jsx

import React, { useState } from "react";
import UserInfoForm from "../shared/UserInforForm";

const UserInfo = ({ user, onSaveUser, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localUserData, setLocalUserData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setLocalUserData({
      name: user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
    });
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    try {
      await onSaveUser(localUserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    }
  };

  return (
    <div className="user-info-section">
      <h2 className="h4 font-weight-bold mb-3">Thông tin người dùng</h2>
      {!isEditing ? (
        <>
          <div className="mb-4">
            <h5>Họ tên</h5>
            <p>{user?.name}</p>
          </div>
          <div className="mb-4">
            <h5>Số điện thoại</h5>
            <p>{user?.phone}</p>
          </div>
          <button className="btn btn-dark mt-3" onClick={handleEditClick}>
            Chỉnh sửa thông tin
          </button>
        </>
      ) : (
        <>
          <UserInfoForm
            formData={localUserData}
            setFormData={setLocalUserData}
          />
          <div className="text-right mt-4">
            <button
              className="btn btn-secondary mr-2"
              onClick={handleCancelEdit}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveChanges}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfo;
