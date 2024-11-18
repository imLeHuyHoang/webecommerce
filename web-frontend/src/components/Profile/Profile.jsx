import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    addresses: [{ province: "", district: "", ward: "", street: "" }],
  });
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Reference for detecting outside clicks
  const newAddressFormRef = useRef(null);

  // Validation schema
  const profileSchema = z.object({
    name: z.string().min(1, "Họ tên không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    gender: z.enum(["male", "female", "other"]),
    addresses: z.array(
      z.object({
        province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
        district: z.string().min(1, "Quận/Huyện không được để trống"),
        ward: z.string().min(1, "Phường/Xã không được để trống"),
        street: z.string().min(1, "Đường không được để trống"),
      })
    ),
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        setUser(response.data);
        setFormData({
          name: response.data.name,
          phone: response.data.phone,
          gender: response.data.gender,
          addresses: response.data.addresses.length
            ? response.data.addresses
            : [{ province: "", district: "", ward: "", street: "" }],
        });
      } catch (error) {
        setToastMessage("Lỗi khi tải thông tin người dùng.");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Update profile fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Update individual address fields for editing
  const handleAddressChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAddresses = formData.addresses.map((address, i) =>
      i === index ? { ...address, [name]: value } : address
    );
    setFormData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));
  };

  // Add a new address
  const handleAddNewAddress = () => {
    setFormData((prevData) => ({
      ...prevData,
      addresses: [...prevData.addresses, { ...newAddress }],
    }));
    setNewAddress({ province: "", district: "", ward: "", street: "" });
    setShowNewAddressForm(false);
  };

  // Delete an address
  const handleDeleteAddress = (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));
  };

  // Submit profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      profileSchema.parse(formData);
      const response = await apiClient.put("/user/profile", formData);
      setUser(response.data);
      setIsEditing(false);
      setShowNewAddressForm(false);
      setToastMessage("Cập nhật thông tin thành công.");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Lỗi khi cập nhật thông tin người dùng.");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle outside click to close new address form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        newAddressFormRef.current &&
        !newAddressFormRef.current.contains(event.target) &&
        showNewAddressForm
      ) {
        setShowNewAddressForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNewAddressForm]);

  if (loading) return <p>Đang tải thông tin người dùng...</p>;

  return (
    <div className="container profile-page">
      {/* Frame 1: Chào mừng người dùng */}
      <div className="welcome-frame text-left">
        <div className="welcome-frame-text">
          Xin chào, {user.name}! Rất vui khi bạn đã quay lại!{" "}
          <span role="img" aria-label="smile">
            😊
          </span>
        </div>
      </div>

      {/* Frame 2: Tình trạng đơn hàng */}
      <div className="order-status-frame my-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card status-card pending">
              <div className="card-body text-center">
                <i className="fas fa-hourglass-half fa-2x mb-2"></i>
                <h5>Đang chờ xác nhận:3</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card status-card shipping">
              <div className="card-body text-center">
                <i className="fas fa-shipping-fast fa-2x mb-2"></i>
                <h5>Đang giao hàng:2</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card status-card canceled">
              <div className="card-body text-center">
                <i className="fas fa-times-circle fa-2x mb-2"></i>
                <h5>Đã hủy:1</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 3: Thông tin người dùng */}
      <div className="user-info-frame my-4">
        <h3>
          Thông tin người dùng{" "}
          <i
            className="fas fa-edit edit-icon"
            onClick={() => setIsEditing(!isEditing)}
          ></i>
        </h3>
        {!isEditing ? (
          <div className="row">
            {/* Cột bên trái: Thông tin cá nhân */}
            <div className="col-md-6">
              <div className="info-field">
                <strong>Họ tên:</strong> {user.name}
              </div>
              <div className="info-field">
                <strong>Số điện thoại:</strong> {user.phone}
              </div>
              <div className="info-field">
                <strong>Giới tính:</strong>{" "}
                {user.gender === "male"
                  ? "Nam"
                  : user.gender === "female"
                  ? "Nữ"
                  : "Khác"}
              </div>
            </div>
            {/* Cột bên phải: Địa chỉ */}
            <div className="col-md-6">
              {user.addresses.map((address, index) => (
                <div key={index} className="address-card p-3 mb-2">
                  <h5>Địa chỉ {index + 1}</h5>
                  <p>
                    {address.street}, {address.ward}, {address.district},{" "}
                    {address.province}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Form chỉnh sửa thông tin
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Cột bên trái: Thông tin cá nhân */}
              <div className="col-md-6">
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select
                    className="form-control"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              {/* Cột bên phải: Địa chỉ */}
              <div className="col-md-6">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="address-edit-card p-3 mb-2">
                    <h5>
                      Địa chỉ {index + 1}
                      <i
                        className="fas fa-trash-alt delete-icon ml-2"
                        onClick={() => handleDeleteAddress(index)}
                      ></i>
                    </h5>
                    <div className="form-group">
                      <label>Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        className="form-control"
                        name="province"
                        value={address.province}
                        onChange={(e) => handleAddressChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện</label>
                      <input
                        type="text"
                        className="form-control"
                        name="district"
                        value={address.district}
                        onChange={(e) => handleAddressChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phường/Xã</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ward"
                        value={address.ward}
                        onChange={(e) => handleAddressChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Đường</label>
                      <input
                        type="text"
                        className="form-control"
                        name="street"
                        value={address.street}
                        onChange={(e) => handleAddressChange(index, e)}
                      />
                    </div>
                  </div>
                ))}
                {/* Nút thêm địa chỉ mới */}
                <button
                  type="button"
                  className="btn btn-primary mt-2"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  Thêm địa chỉ
                </button>
                {/* Form thêm địa chỉ mới */}
                {showNewAddressForm && (
                  <div
                    className="address-new-card p-3 mb-2 mt-2"
                    ref={newAddressFormRef}
                  >
                    <h5>Thêm địa chỉ mới</h5>
                    <div className="form-group">
                      <label>Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        className="form-control"
                        name="province"
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            province: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện</label>
                      <input
                        type="text"
                        className="form-control"
                        name="district"
                        value={newAddress.district}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            district: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Phường/Xã</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ward"
                        value={newAddress.ward}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            ward: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Đường</label>
                      <input
                        type="text"
                        className="form-control"
                        name="street"
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
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddNewAddress}
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Nút lưu thay đổi */}
            <div className="text-right mt-3">
              <button
                type="button"
                className="btn btn-secondary mr-2"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast notifications */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Profile;
