// src/components/Checkout/UserInfoSection.jsx
import React from "react";
import UserInfoForm from "../shared/UserInforForm";

const UserInfoSection = ({
  userInfo,
  checkoutFormData,
  setCheckoutFormData,
  isEditingUserInfo,
  setIsEditingUserInfo,
  onSubmit,
}) => {
  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    onSubmit(checkoutFormData);
  };

  return (
    <div className="checkout-page-user-card card mb-4 user-information">
      <div className="checkout-page-user-card-body card-body">
        {userInfo && (
          <>
            {!userInfo.name || !userInfo.phone || isEditingUserInfo ? (
              <form onSubmit={handleUserInfoSubmit}>
                <p className="checkout-page-userinfo-alert">
                  Vui lòng bổ sung thông tin để tiếp tục thanh toán.
                </p>
                <UserInfoForm
                  formData={checkoutFormData}
                  setFormData={setCheckoutFormData}
                />
                <button type="submit" className="btn btn-primary mt-3">
                  Lưu thông tin
                </button>
              </form>
            ) : (
              <>
                <p className="checkout-page-userinfo-name card-text">
                  <strong>Họ và tên:</strong> {userInfo.name}
                </p>
                <p className="checkout-page-userinfo-phone card-text">
                  <strong>Số điện thoại:</strong> {userInfo.phone}
                </p>
                <button
                  className="checkout-page-userinfo-edit-btn btn btn-link"
                  onClick={() => setIsEditingUserInfo(true)}
                >
                  Chỉnh sửa thông tin
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfoSection;
