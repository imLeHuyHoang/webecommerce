import React from "react";

const AddressSection = ({
  userInfo,
  selectedAddress,
  setSelectedAddress,
  isEditingAddress,
  setIsEditingAddress,
  isAddingNewAddress,
  setIsAddingNewAddress,
  newAddress,
  setNewAddress,
  handleAddNewAddress,
}) => {
  return (
    <>
      {selectedAddress ? (
        <div className="checkout-page-user-card card mb-4 user-information">
          <div className="checkout-page-user-card-body card-body">
            <p className="checkout-page-userinfo-address card-text">
              <strong>Địa chỉ:</strong>{" "}
              {`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}
            </p>
            <button
              className="checkout-page-address-edit-btn btn btn-primary"
              onClick={() => setIsEditingAddress(!isEditingAddress)}
            >
              Thay đổi địa chỉ
            </button>
            {isEditingAddress && userInfo && userInfo.addresses && (
              <div className="checkout-page-address-select-section mb-3">
                <label className="checkout-page-address-select-label form-label">
                  Chọn địa chỉ khác
                </label>
                <select
                  className="checkout-page-address-select form-select"
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
                  className="checkout-page-new-address-btn btn btn-secondary mt-2"
                  onClick={() => setIsAddingNewAddress(true)}
                >
                  Thêm địa chỉ mới
                </button>
                {isAddingNewAddress && (
                  <div
                    id="newAddressForm"
                    className="checkout-page-new-address-form mt-3"
                  >
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
                      <label className="form-label">Số nhà, tên đường</label>
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
                      className="checkout-page-save-address-btn btn btn-primary"
                      onClick={handleAddNewAddress}
                    >
                      Lưu địa chỉ mới
                    </button>
                    <button
                      className="checkout-page-cancel-address-btn btn btn-link"
                      onClick={() => setIsAddingNewAddress(false)}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="checkout-page-user-card card mb-4 user-information">
          <div className="checkout-page-user-card-body card-body">
            <p className="checkout-page-no-address-alert">
              Bạn chưa có địa chỉ giao hàng.
            </p>
            <button
              className="checkout-page-add-address-btn btn btn-secondary mt-2"
              onClick={() => setIsAddingNewAddress(true)}
            >
              Thêm địa chỉ mới
            </button>
            {isAddingNewAddress && (
              <div
                id="newAddressForm"
                className="checkout-page-new-address-form mt-3"
              >
                {/* Form thêm địa chỉ tương tự ở trên */}
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
                  <label className="form-label">Số nhà, tên đường</label>
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
                  className="checkout-page-save-address-btn btn btn-primary"
                  onClick={handleAddNewAddress}
                >
                  Lưu địa chỉ mới
                </button>
                <button
                  className="checkout-page-cancel-address-btn btn btn-link"
                  onClick={() => setIsAddingNewAddress(false)}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddressSection;
