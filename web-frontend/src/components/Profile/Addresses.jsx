// src/components/Profile/Addresses.jsx
import React, { useState } from "react";

const Addresses = ({ addresses, onSaveAddresses, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  // localAddresses để chứa bản sao của addresses khi chỉnh sửa
  const [localAddresses, setLocalAddresses] = useState(addresses || []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Hủy thì set lại localAddresses = addresses gốc
    setLocalAddresses(addresses);
    setIsEditing(false);
  };

  // Khi thay đổi 1 trường của 1 address, ta update localAddresses tương ứng
  const handleAddressChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...localAddresses];
    updated[index] = { ...updated[index], [name]: value };
    setLocalAddresses(updated);
  };

  // Xóa 1 address
  const handleDeleteAddress = (index) => {
    const updated = localAddresses.filter((_, i) => i !== index);
    setLocalAddresses(updated);
  };

  // Thêm address rỗng
  const handleAddNewAddress = () => {
    setLocalAddresses([
      ...localAddresses,
      { province: "", district: "", ward: "", street: "" },
    ]);
  };

  // Lưu thay đổi vào DB
  const handleSaveChanges = async () => {
    try {
      await onSaveAddresses(localAddresses);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
    }
  };

  return (
    <div className="addresses-section">
      <h2 className="h4 font-weight-bold mb-3">Địa chỉ</h2>

      {/* Nếu chưa ấn Chỉnh sửa, chỉ hiển thị danh sách địa chỉ */}
      {!isEditing ? (
        <>
          {addresses?.map((address, index) => (
            <div key={index} className="bg-light p-3 rounded shadow-sm mb-3">
              <h5>Địa chỉ {index + 1}</h5>
              <p>
                <strong>Số nhà/Đường:</strong> {address.street}
              </p>
              <p>
                <strong>Phường/Xã:</strong> {address.ward}
              </p>
              <p>
                <strong>Quận/Huyện:</strong> {address.district}
              </p>
              <p>
                <strong>Tỉnh/Thành:</strong> {address.province}
              </p>
            </div>
          ))}
          <button className="btn btn-dark mt-3" onClick={handleEditClick}>
            Chỉnh sửa địa chỉ
          </button>
        </>
      ) : (
        <>
          {localAddresses?.map((address, index) => (
            <div key={index} className="bg-light p-3 rounded shadow-sm mb-3">
              <h5>
                Địa chỉ {index + 1}
                <button
                  className="btn btn-sm btn-danger ml-2"
                  onClick={() => handleDeleteAddress(index)}
                >
                  Xóa
                </button>
              </h5>

              {/* Form fields đầy đủ cho từng address */}
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <input
                  type="text"
                  name="province"
                  value={address.province}
                  className="form-control"
                  onChange={(e) => handleAddressChange(index, e)}
                />
              </div>
              <div className="form-group">
                <label>Quận/Huyện</label>
                <input
                  type="text"
                  name="district"
                  value={address.district}
                  className="form-control"
                  onChange={(e) => handleAddressChange(index, e)}
                />
              </div>
              <div className="form-group">
                <label>Phường/Xã</label>
                <input
                  type="text"
                  name="ward"
                  value={address.ward}
                  className="form-control"
                  onChange={(e) => handleAddressChange(index, e)}
                />
              </div>
              <div className="form-group">
                <label>Số nhà, tên đường</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  className="form-control"
                  onChange={(e) => handleAddressChange(index, e)}
                />
              </div>
            </div>
          ))}

          <button className="btn btn-dark" onClick={handleAddNewAddress}>
            Thêm địa chỉ mới
          </button>

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

export default Addresses;
