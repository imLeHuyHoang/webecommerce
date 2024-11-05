import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { Modal, Button, Form } from "react-bootstrap";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    addresses: [{ province: "", district: "", ward: "", street: "" }],
  });
  const navigate = useNavigate();

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
        console.error("Profile error:", error);
        setError("Lỗi khi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put("/user/profile", formData);
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      setError("Lỗi khi cập nhật thông tin người dùng.");
    }
  };

  if (loading) return <p>Đang tải thông tin người dùng...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <section className="vh-100 profile-section">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-lg-6 mb-4 mb-lg-0">
            <div className="card mb-3 profile-card">
              <div className="row g-0">
                <div className="col-md-4 gradient-custom text-center text-white profile-image-container">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                    alt="Avatar"
                    className="img-fluid my-5 profile-image"
                  />
                  <h5 className="profile-name">{user?.name}</h5>
                  <p className="profile-gender">{user?.gender}</p>
                  <i
                    className="far fa-edit mb-5 profile-edit-icon"
                    onClick={() => setIsEditing(true)}
                  ></i>
                </div>
                <div className="col-md-8">
                  <div className="card-body p-4">
                    <h6 className="profile-info-title">Thông Tin Cá Nhân</h6>
                    <hr className="mt-0 mb-4" />
                    <div className="row pt-1">
                      <div className="col-6 mb-3">
                        <h6 className="profile-info-label">Email</h6>
                        <p className="text-muted profile-info-value">
                          {user?.email}
                        </p>
                      </div>
                      <div className="col-6 mb-3">
                        <h6 className="profile-info-label">Số Điện Thoại</h6>
                        <p className="text-muted profile-info-value">
                          {user?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="row pt-1">
                      <div className="col-12 mb-3">
                        <h6 className="profile-info-label">Địa Chỉ</h6>
                        <p className="text-muted profile-info-value">
                          {user?.addresses
                            .map(
                              (address) =>
                                `${address.street}, ${address.ward}, ${address.district}, ${address.province}`
                            )
                            .join("; ")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline-light"
                      className="profile-back-button mt-4"
                      onClick={() => navigate("/")}
                    >
                      Quay Lại Trang Chủ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Modal show={isEditing} onHide={() => setIsEditing(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Cập Nhật Thông Tin</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleSubmit}>
                  <div className="d-flex">
                    <div className="w-50 pe-2">
                      <Form.Group className="mb-3">
                        <Form.Label>Họ Tên</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          placeholder={user?.name || "Nhập họ tên"}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Số Điện Thoại</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={formData.phone}
                          placeholder={user?.phone || "Nhập số điện thoại"}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Giới Tính</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="w-50 ps-2">
                      {formData.addresses.map((address, index) => (
                        <div key={index} className="mb-3">
                          <Form.Group className="mb-2">
                            <Form.Label>Tỉnh/Thành Phố</Form.Label>
                            <Form.Control
                              type="text"
                              name="province"
                              value={address.province}
                              placeholder={
                                user?.addresses[index]?.province ||
                                "Nhập tỉnh/thành phố"
                              }
                              onChange={(e) => handleAddressChange(index, e)}
                              className="input-field"
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Quận/Huyện</Form.Label>
                            <Form.Control
                              type="text"
                              name="district"
                              value={address.district}
                              placeholder={
                                user?.addresses[index]?.district ||
                                "Nhập quận/huyện"
                              }
                              onChange={(e) => handleAddressChange(index, e)}
                              className="input-field"
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Phường/Xã</Form.Label>
                            <Form.Control
                              type="text"
                              name="ward"
                              value={address.ward}
                              placeholder={
                                user?.addresses[index]?.ward || "Nhập phường/xã"
                              }
                              onChange={(e) => handleAddressChange(index, e)}
                              className="input-field"
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Đường</Form.Label>
                            <Form.Control
                              type="text"
                              name="street"
                              value={address.street}
                              placeholder={
                                user?.addresses[index]?.street ||
                                "Nhập tên đường"
                              }
                              onChange={(e) => handleAddressChange(index, e)}
                              className="input-field"
                            />
                          </Form.Group>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button variant="primary" type="submit" className="ms-2">
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
