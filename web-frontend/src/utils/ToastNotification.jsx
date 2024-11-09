// ToastNotification.jsx
import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import "./ToastNotification.css"; // CSS riêng nếu cần

const ToastNotification = ({ message, show, onClose }) => {
  return (
    <ToastContainer position="top-center" className="p-3 toast-container">
      <Toast onClose={onClose} show={show} delay={3000} autohide>
        <Toast.Header>
          <strong className="me-auto">Thông báo</strong>
          <small>Vừa xong</small>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;