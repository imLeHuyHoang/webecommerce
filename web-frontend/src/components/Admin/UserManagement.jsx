// src/pages/UserManagement/UserManagement.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { z } from "zod";
import apiClient from "../../utils/api-client";
import ToastNotification from "../ToastNotification/ToastNotification";
import "./UserManagement.css";

const newUserSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

const existingUserSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional(),
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò"),
  password: z
    .string()
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .optional()
    .or(z.literal("")),
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from backend
  const fetchUsers = async (search = "") => {
    setLoading(true);
    try {
      const response = await apiClient.get("/user/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          search: search,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setToastMessage("Lỗi tải người dùng");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser({
      name: "",
      email: "",
      password: "",
      roles: [],
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser({ ...user, password: "" });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?"))
      return;

    try {
      await apiClient.delete(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
      setToastMessage("Xóa người dùng thành công");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      setToastMessage("Lỗi xóa người dùng");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      const updatedUser = { isActive: !user.isActive };

      const response = await apiClient.put(`/user/${userId}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers(users.map((u) => (u._id === userId ? response.data : u)));
      setToastMessage("Cập nhật trạng thái người dùng thành công");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error updating user status:", error);
      setToastMessage("Lỗi cập nhật trạng thái người dùng");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleSaveUser = async () => {
    try {
      const userToSubmit = { ...selectedUser };

      if (!userToSubmit.password) {
        delete userToSubmit.password;
      }

      if (userToSubmit._id) {
        existingUserSchema.parse(userToSubmit);
      } else {
        newUserSchema.parse(userToSubmit);
      }

      if (userToSubmit._id) {
        const response = await apiClient.put(
          `/user/${userToSubmit._id}`,
          userToSubmit,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userToSubmit._id ? response.data : user
          )
        );
        setToastMessage("Cập nhật người dùng thành công");
        setToastVariant("success");
      } else {
        const response = await apiClient.post("/user/admin", userToSubmit, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUsers((prevUsers) => [...prevUsers, response.data]);
        setToastMessage("Thêm người dùng thành công");
        setToastVariant("success");
      }
      setShowToast(true);
      setShowModal(false);
      setErrors({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errorObject = {};
        e.errors.forEach((error) => {
          errorObject[error.path[0]] = error.message;
        });
        setErrors(errorObject);
      } else if (e.response && e.response.data && e.response.data.message) {
        setToastMessage(e.response.data.message);
        setToastVariant("danger");
        setShowToast(true);
      } else {
        console.error("Error saving user:", e);
        setToastMessage("Lỗi lưu người dùng");
        setToastVariant("danger");
        setShowToast(true);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleRolesChange = (e) => {
    const options = e.target.options;
    const roles = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        roles.push(options[i].value);
      }
    }
    setSelectedUser({ ...selectedUser, roles });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    fetchUsers(searchTerm);
  };

  if (loading) {
    return (
      <Container fluid className="manage-user-container-loading text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="manage-user-container">
      <Row className="manage-user-row mb-4">
        <Col className="manage-user-col-title">
          <h1 className="manage-user-title text-center">Quản lý người dùng</h1>
        </Col>
      </Row>
      <Row className="manage-user-row mb-4 manage-user-search-row">
        <Row className="manage-user-col-search-input">
          <Form.Control
            type="text"
            className="manage-user-search-input"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button
            variant="primary"
            className="manage-user-search-button"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </Row>
      </Row>
      <Row className="manage-user-row mb-4 manage-user-add-row">
        <Col className="manage-user-col-add-button">
          <Button
            variant="primary"
            className="manage-user-add-user-button"
            onClick={handleAddUser}
          >
            Thêm người dùng mới
          </Button>
        </Col>
      </Row>
      <Row className="manage-user-row manage-user-table-row">
        <Col className="manage-user-col-table">
          <Table
            striped
            bordered
            hover
            responsive
            className="manage-user-table"
          >
            <thead className="manage-user-thead">
              <tr className="manage-user-tr">
                <th className="manage-user-th">Tên</th>
                <th className="manage-user-th">Email</th>
                <th className="manage-user-th">Số điện thoại</th>
                <th className="manage-user-th">Vai trò</th>
                <th className="manage-user-th">Trạng thái</th>
                <th className="manage-user-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="manage-user-tbody">
              {users.map((user) => (
                <tr className="manage-user-tr" key={user._id}>
                  <td className="manage-user-td">{user.name}</td>
                  <td className="manage-user-td">{user.email}</td>
                  <td className="manage-user-td">
                    {user.phone && Array.isArray(user.phone)
                      ? user.phone.join(", ")
                      : user.phone || ""}
                  </td>
                  <td className="manage-user-td">{user.roles.join(", ")}</td>
                  <td className="manage-user-td">
                    {user.isActive ? "Hoạt động" : "Đã chặn"}
                  </td>
                  <td className="manage-user-td">
                    <Button
                      variant="warning"
                      className="manage-user-edit-button me-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      className="manage-user-delete-button me-2"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Xóa
                    </Button>
                    <Button
                      variant={user.isActive ? "secondary" : "success"}
                      className="manage-user-ban-button"
                      onClick={() => handleBanUser(user._id)}
                    >
                      {user.isActive ? "Chặn" : "Bỏ chặn"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add/Edit User Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        className="manage-user-modal"
      >
        <Modal.Header closeButton className="manage-user-modal-header">
          <Modal.Title className="manage-user-modal-title">
            {selectedUser?._id ? "Sửa người dùng" : "Thêm người dùng mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="manage-user-modal-body">
          <Form className="manage-user-form">
            {/* Name Field */}
            <Form.Group
              className="manage-user-form-group mb-3"
              controlId="formUserName"
            >
              <Form.Label className="manage-user-label">Tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                className="manage-user-input"
                value={selectedUser?.name || ""}
                onChange={handleChange}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback
                type="invalid"
                className="manage-user-feedback"
              >
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email Field */}
            <Form.Group
              className="manage-user-form-group mb-3"
              controlId="formUserEmail"
            >
              <Form.Label className="manage-user-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                className="manage-user-input"
                value={selectedUser?.email || ""}
                onChange={handleChange}
                isInvalid={!!errors.email}
                required
                disabled={!!selectedUser?._id}
              />
              <Form.Control.Feedback
                type="invalid"
                className="manage-user-feedback"
              >
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password Field */}
            <Form.Group
              className="manage-user-form-group mb-3"
              controlId="formUserPassword"
            >
              <Form.Label className="manage-user-label">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                className="manage-user-input"
                value={selectedUser?.password || ""}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder={
                  selectedUser?._id ? "Để trống nếu không muốn thay đổi" : ""
                }
              />
              <Form.Control.Feedback
                type="invalid"
                className="manage-user-feedback"
              >
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Roles Field */}
            <Form.Group
              className="manage-user-form-group mb-3"
              controlId="formUserRoles"
            >
              <Form.Label className="manage-user-label">Vai trò</Form.Label>
              <Form.Control
                as="select"
                multiple
                name="roles"
                className="manage-user-input"
                value={selectedUser?.roles || []}
                onChange={handleRolesChange}
                isInvalid={!!errors.roles}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
              <Form.Control.Feedback
                type="invalid"
                className="manage-user-feedback"
              >
                {errors.roles}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>

        {/* Modal Footer */}
        <Modal.Footer className="manage-user-modal-footer">
          <Button
            variant="secondary"
            className="manage-user-close-modal-button"
            onClick={() => setShowModal(false)}
          >
            Đóng
          </Button>
          <Button
            variant="primary"
            className="manage-user-save-button"
            onClick={handleSaveUser}
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        variant={toastVariant}
      />
    </Container>
  );
};

export default UserManagement;
