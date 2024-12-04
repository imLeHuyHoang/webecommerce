// UserManagement.jsx

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

// Validation schemas using zod

// Schema for new users
const newUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schema for existing users
const existingUserSchema = z
  .object({
    _id: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional(),
    roles: z.array(z.string()).min(1, "At least one role is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional()
      .or(z.literal("")),
  })
  .nonstrict();

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // New state for variant
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // API base URL
  const API_URL = import.meta.env.VITE_API_BASE_URL + "/user";

  // Access token from local storage or context
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(response.data);
      setToastMessage("Users fetched successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      setToastMessage("Error fetching users");
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiClient.delete(`${API_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
      setToastMessage("User deleted successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      setToastMessage("Error deleting user");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      // Find the user
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      // Toggle isActive status
      const updatedUser = { isActive: !user.isActive };

      // Update user in backend
      const response = await apiClient.put(
        `${API_URL}/${userId}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update users state
      setUsers(users.map((u) => (u._id === userId ? response.data : u)));
      setToastMessage("User status updated successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error updating user status:", error);
      setToastMessage("Error updating user status");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleSaveUser = async () => {
    try {
      // Prepare the user data for validation and submission
      const userToSubmit = { ...selectedUser };

      // If password is empty, delete it from the object
      if (!userToSubmit.password) {
        delete userToSubmit.password;
      }

      // Choose the appropriate schema
      if (userToSubmit._id) {
        existingUserSchema.parse(userToSubmit);
      } else {
        newUserSchema.parse(userToSubmit);
      }

      if (userToSubmit._id) {
        // Update existing user
        const response = await apiClient.put(
          `${API_URL}/${userToSubmit._id}`,
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
        setToastMessage("User updated successfully");
        setToastVariant("success");
      } else {
        // Add new user
        const response = await apiClient.post(
          `${API_URL}/admin`,
          userToSubmit,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUsers((prevUsers) => [...prevUsers, response.data]);
        setToastMessage("User added successfully");
        setToastVariant("success");
      }
      setShowToast(true);
      setShowModal(false);
      setErrors({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Set validation errors
        const errorObject = {};
        e.errors.forEach((error) => {
          errorObject[error.path[0]] = error.message;
        });
        setErrors(errorObject);
      } else if (e.response && e.response.data && e.response.data.message) {
        // Handle server validation errors
        setToastMessage(e.response.data.message);
        setToastVariant("danger");
        setShowToast(true);
      } else {
        console.error("Error saving user:", e);
        setToastMessage("Error saving user");
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

  if (loading) {
    return (
      <Container fluid className="text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">User Management</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={handleAddUser}>
            Add New User
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {/* Removed ID column for brevity */}
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  {/* Removed ID cell for brevity */}
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.roles.join(", ")}</td>
                  <td>{user.isActive ? "Active" : "Banned"}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEditUser(user)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user._id)}
                      className="me-2"
                    >
                      Delete
                    </Button>
                    <Button
                      variant={user.isActive ? "secondary" : "success"}
                      onClick={() => handleBanUser(user._id)}
                    >
                      {user.isActive ? "Ban" : "Unban"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?._id ? "Edit User" : "Add New User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Name Field */}
            <Form.Group className="mb-3" controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedUser?.name || ""}
                onChange={handleChange}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-3" controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={selectedUser?.email || ""}
                onChange={handleChange}
                isInvalid={!!errors.email}
                required
                disabled={!!selectedUser?._id}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3" controlId="formUserPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={selectedUser?.password || ""}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder={
                  selectedUser?._id ? "Leave blank to keep unchanged" : ""
                }
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Roles Field */}
            <Form.Group className="mb-3" controlId="formUserRoles">
              <Form.Label>Roles</Form.Label>
              <Form.Control
                as="select"
                multiple
                name="roles"
                value={selectedUser?.roles || []}
                onChange={handleRolesChange}
                isInvalid={!!errors.roles}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.roles}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>

        {/* Modal Footer */}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        variant={toastVariant} // Pass the variant here
      />
    </Container>
  );
};

export default UserManagement;
