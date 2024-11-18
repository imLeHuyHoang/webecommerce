// UserManagement.jsx - Techstore Admin User Management with Roles and Permissions

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { z } from "zod";
import ToastNotification from "../ToastNotification/ToastNotification";

// Define the validation schema using zod
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch user list from server or database (mocked data for now)
    setUsers([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        roles: ["user"],
        isActive: true,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        roles: ["admin"],
        isActive: true,
      },
    ]);
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
    setToastMessage("User deleted successfully");
    setShowToast(true);
  };

  const handleBanUser = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
    setToastMessage("User status updated successfully");
    setShowToast(true);
  };

  const handleSaveUser = () => {
    try {
      // Validate the selected user using the schema
      userSchema.parse(selectedUser);

      if (selectedUser.id) {
        // Update existing user
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? selectedUser : user
          )
        );
        setToastMessage("User updated successfully");
      } else {
        // Add new user
        setUsers((prevUsers) => [
          ...prevUsers,
          { ...selectedUser, id: prevUsers.length + 1 },
        ]);
        setToastMessage("User added successfully");
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
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

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
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
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
                      onClick={() => handleDeleteUser(user.id)}
                      className="me-2"
                    >
                      Delete
                    </Button>
                    <Button
                      variant={user.isActive ? "secondary" : "success"}
                      onClick={() => handleBanUser(user.id)}
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
            {selectedUser?.id ? "Edit User" : "Add New User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
            <Form.Group className="mb-3" controlId="formUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={selectedUser?.email || ""}
                onChange={handleChange}
                isInvalid={!!errors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={selectedUser?.password || ""}
                onChange={handleChange}
                isInvalid={!!errors.password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserRoles">
              <Form.Label>Roles</Form.Label>
              <Form.Control
                as="select"
                multiple
                name="roles"
                value={selectedUser?.roles || []}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    roles: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
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
      />
    </Container>
  );
};

export default UserManagement;
