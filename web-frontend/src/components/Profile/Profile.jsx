import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Accordion,
  Spinner,
  Tab,
  Nav,
} from "react-bootstrap";
import { z } from "zod";
import ToastNotification from "../../utils/ToastNotification";
import "./Profile.css";

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
  const navigate = useNavigate();

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

  const handleDeleteAddress = (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      profileSchema.parse(formData);
      setSaving(true);
      const response = await apiClient.put("/user/profile", formData);
      setUser(response.data);
      setIsEditing(false);
      setToastMessage("Cập nhật thông tin thành công.");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Lỗi khi cập nhật thông tin người dùng.");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="loading-text">Đang tải thông tin người dùng...</p>;

  return (
    <section className="profile-section">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-8">
            <div className="card profile-card">
              <div className="row g-0">
                <div className="col-md-4 profile-image-section">
                  <div className="profile-image-wrapper">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                      alt="Avatar"
                      className="profile-image"
                    />
                    <i
                      className="far fa-edit profile-edit-icon"
                      onClick={() => setIsEditing(true)}
                    ></i>
                  </div>
                  <h5 className="profile-name">{user?.name}</h5>
                  <span
                    className={`badge ${
                      user?.gender === "male" ? "badge-primary" : "badge-pink"
                    }`}
                  >
                    {user?.gender === "male"
                      ? "Nam"
                      : user?.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </span>
                </div>
                <div className="col-md-8">
                  <div className="card-body profile-details">
                    <h6>Thông Tin Cá Nhân</h6>
                    <hr />
                    <div className="row">
                      <div className="col-6 mb-3">
                        <h6>Email</h6>
                        <p className="text-muted">{user?.email}</p>
                      </div>
                      <div className="col-6 mb-3">
                        <h6>Số Điện Thoại</h6>
                        <p className="text-muted">{user?.phone}</p>
                      </div>
                    </div>
                    <div className="address-section">
                      <h6>Địa Chỉ Giao Hàng</h6>
                      {user?.addresses.map((address, index) => (
                        <p key={index} className="text-muted">
                          <strong>Địa chỉ {index + 1}: </strong>{" "}
                          {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                        </p>
                      ))}
                    </div>
                    <Button
                      variant="outline-primary"
                      className="mt-4"
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
                <Tab.Container defaultActiveKey="personalInfo">
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="personalInfo">
                        Thông Tin Cá Nhân
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="addresses">Địa Chỉ</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content className="pt-3">
                    <Tab.Pane eventKey="personalInfo">
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Họ Tên</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Số Điện Thoại</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Giới Tính</Form.Label>
                          <Form.Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                          >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </Form.Select>
                        </Form.Group>
                        <Button
                          variant="primary"
                          type="submit"
                          className="w-100"
                        >
                          {saving ? (
                            <Spinner as="span" animation="border" size="sm" />
                          ) : (
                            "Lưu Thay Đổi"
                          )}
                        </Button>
                      </Form>
                    </Tab.Pane>
                    <Tab.Pane eventKey="addresses">
                      <Accordion>
                        {formData.addresses.map((address, index) => (
                          <Accordion.Item
                            eventKey={index.toString()}
                            key={index}
                          >
                            <Accordion.Header>
                              Địa Chỉ {index + 1}
                            </Accordion.Header>
                            <Accordion.Body>
                              <Form.Group className="mb-2">
                                <Form.Label>Tỉnh/Thành Phố</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="province"
                                  value={address.province}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label>Quận/Huyện</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="district"
                                  value={address.district}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label>Phường/Xã</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="ward"
                                  value={address.ward}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label>Đường</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="street"
                                  value={address.street}
                                  onChange={(e) =>
                                    handleAddressChange(index, e)
                                  }
                                />
                              </Form.Group>
                              <Button
                                variant="danger"
                                onClick={() => handleDeleteAddress(index)}
                                className="mt-2 w-100"
                              >
                                Xóa Địa Chỉ
                              </Button>
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                      <Button
                        variant="success"
                        onClick={handleAddNewAddress}
                        className="mt-3 w-100"
                      >
                        Thêm Địa Chỉ Mới
                      </Button>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </section>
  );
};

export default Profile;
