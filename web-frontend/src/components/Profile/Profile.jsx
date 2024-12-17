import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../utils/api-client";
import UserInfoForm from "./UserInforForm";
import ToastNotification from "../ToastNotification/ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    addresses: [{ province: "", district: "", ward: "", street: "" }],
  });
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderStatusCounts, setOrderStatusCounts] = useState({
    processing: 0,
    shipping: 0,
    shipped: 0,
    cancelled: 0,
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const navigate = useNavigate();

  const newAddressFormRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, ordersResponse] = await Promise.all([
          apiClient.get("/user/profile"),
          apiClient.get("/order/status-counts"),
        ]);
        setUser(userResponse.data);
        setFormData({
          name: userResponse.data.name || "",
          phone: userResponse.data.phone || "",
          gender: userResponse.data.gender || "",
          addresses: userResponse.data.addresses.length
            ? userResponse.data.addresses
            : [{ province: "", district: "", ward: "", street: "" }],
        });
        setOrderStatusCounts(ordersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setToastMessage("Lỗi khi tải thông tin.");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleAddNewAddress = () => {
    setFormData((prevData) => ({
      ...prevData,
      addresses: [
        ...prevData.addresses,
        { province: "", district: "", ward: "", street: "" },
      ],
    }));
    setToastMessage("Đã thêm địa chỉ mới. Vui lòng chỉnh sửa và lưu.");
    setShowToast(true);
  };

  const handleDeleteAddress = (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      addresses: updatedAddresses,
    }));
    setToastMessage("Đã xóa địa chỉ.");
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        addresses: formData.addresses,
      };
      const response = await apiClient.put("/user/profile", updatedData);
      setUser(response.data);
      setIsEditing(false);
      setToastMessage("Cập nhật thông tin thành công.");
      setShowToast(true);
    } catch (error) {
      console.error("Update error:", error);
      setToastMessage("Lỗi khi cập nhật thông tin người dùng.");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading)
    return (
      <p className="profile-page-loading-text text-center mt-5">
        Đang tải thông tin người dùng...
      </p>
    );

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

        {/* Bố Cục Mới */}
        <div className="profile-page-new-layout">
          {/* Dòng 1: Tình trạng đơn hàng */}
          <div className="profile-page-order-status mb-4">
            <h2 className="profile-page-heading h4 font-weight-bold mb-3">
              Tình trạng đơn hàng
            </h2>
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="profile-page-status-card bg-light p-3 rounded shadow-sm text-center">
                  <h3 className="profile-page-status-title h5 font-weight-bold">
                    Đơn hàng chờ xác nhận
                  </h3>
                  <p className="profile-page-status-count display-4 font-weight-bold">
                    {orderStatusCounts.processing}
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="profile-page-status-card bg-light p-3 rounded shadow-sm text-center">
                  <h3 className="profile-page-status-title h5 font-weight-bold">
                    Đơn hàng đang giao
                  </h3>
                  <p className="profile-page-status-count display-4 font-weight-bold">
                    {orderStatusCounts.shipping}
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="profile-page-status-card bg-light p-3 rounded shadow-sm text-center">
                  <h3 className="profile-page-status-title h5 font-weight-bold">
                    Đơn hàng đã giao
                  </h3>
                  <p className="profile-page-status-count display-4 font-weight-bold">
                    {orderStatusCounts.shipped}
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="profile-page-status-card bg-light p-3 rounded shadow-sm text-center">
                  <h3 className="profile-page-status-title h5 font-weight-bold">
                    Đơn hàng đã hủy
                  </h3>
                  <p className="profile-page-status-count display-4 font-weight-bold">
                    {orderStatusCounts.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dòng 2: Thông tin người dùng và Địa chỉ */}
          <div className="row">
            {/* Cột trái: Thông tin người dùng */}
            <div className="col-md-6 mb-4">
              <div className="profile-page-user-info">
                <h2 className="profile-page-heading h4 font-weight-bold mb-3">
                  Thông tin người dùng
                  <i
                    className="fas fa-edit ml-2 profile-page-edit-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsEditing(!isEditing)}
                  ></i>
                </h2>
                {!isEditing ? (
                  <>
                    <div className="profile-page-personal-info mb-4">
                      <h3 className="profile-page-subheading h5 font-weight-bold mb-2">
                        Thông tin cá nhân
                      </h3>
                      <div className="row">
                        <div className="col-md-6">
                          <label className="profile-page-label text-muted">
                            Họ tên
                          </label>
                          <p className="profile-page-info bg-light p-2 rounded">
                            {user?.name}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label className="profile-page-label text-muted">
                            Số điện thoại
                          </label>
                          <p className="profile-page-info bg-light p-2 rounded">
                            {user?.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        className="profile-page-edit-btn btn btn-dark mt-3"
                        onClick={() => setIsEditing(true)}
                      >
                        Chỉnh sửa thông tin
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="profile-page-edit-personal mb-4">
                      <h3 className="profile-page-subheading h5 font-weight-bold mb-2">
                        Chỉnh sửa thông tin cá nhân
                      </h3>
                      <UserInfoForm
                        formData={formData}
                        setFormData={setFormData}
                      />
                    </div>

                    <div className="profile-page-buttons text-right mt-4">
                      <button
                        type="button"
                        className="profile-page-cancel-btn btn btn-secondary mr-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="profile-page-save-btn btn btn-primary"
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Cột phải: Địa chỉ */}
            <div className="col-md-6 mb-4">
              <div className="profile-page-addresses">
                <h2 className="profile-page-heading h4 font-weight-bold mb-3">
                  Địa chỉ
                  {!isEditing && (
                    <i
                      className="fas fa-edit ml-2 profile-page-edit-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => setIsEditing(true)}
                    ></i>
                  )}
                </h2>
                {!isEditing ? (
                  <>
                    <div className="row">
                      {user?.addresses.map((address, index) => (
                        <div key={index} className="col-md-12 mb-3">
                          <div className="profile-page-address-card bg-light p-3 rounded shadow-sm">
                            <h4 className="profile-page-address-title font-weight-bold">
                              Địa chỉ {index + 1}
                            </h4>
                            <p className="profile-page-address-line">
                              <strong>Số nhà, tên đường:</strong>{" "}
                              {address.street}
                            </p>
                            <p className="profile-page-address-line">
                              <strong>Phường/Xã:</strong> {address.ward}
                            </p>
                            <p className="profile-page-address-line">
                              <strong>Quận/Huyện:</strong> {address.district}
                            </p>
                            <p className="profile-page-address-line">
                              <strong>Tỉnh/Thành phố:</strong>{" "}
                              {address.province}
                            </p>
                            <div className="mt-2">
                              <button
                                className="profile-page-edit-address-btn btn btn-dark mr-2"
                                onClick={() => setIsEditing(true)}
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                className="profile-page-delete-address-btn btn btn-danger"
                                onClick={() => handleDeleteAddress(index)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="profile-page-add-address-btn btn btn-dark mt-3"
                      onClick={() => {
                        setIsEditing(true);
                        handleAddNewAddress();
                      }}
                    >
                      Thêm địa chỉ mới
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="profile-page-edit-addresses mb-4">
                      <h3 className="profile-page-subheading h5 font-weight-bold mb-2">
                        Chỉnh sửa địa chỉ
                      </h3>
                      <div className="row">
                        {formData.addresses.map((address, index) => (
                          <div key={index} className="col-md-12 mb-3">
                            <div className="profile-page-address-card bg-light p-3 rounded shadow-sm">
                              <h4 className="profile-page-address-title font-weight-bold">
                                Địa chỉ {index + 1}
                                <i
                                  className="fas fa-trash-alt text-danger ml-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleDeleteAddress(index)}
                                ></i>
                              </h4>
                              <div className="form-group">
                                <label>Tỉnh/Thành phố</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="province"
                                  value={address.province}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Quận/Huyện</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="district"
                                  value={address.district}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Phường/Xã</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ward"
                                  value={address.ward}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Số nhà, tên đường</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="street"
                                  value={address.street}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="profile-page-buttons text-right mt-4">
                      <button
                        type="button"
                        className="profile-page-cancel-btn btn btn-secondary mr-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="profile-page-save-btn btn btn-primary"
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
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
