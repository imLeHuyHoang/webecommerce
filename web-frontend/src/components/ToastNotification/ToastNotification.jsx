// src/components/ToastNotification/ToastNotification.jsx

import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import PropTypes from "prop-types";
import "./ToastNotification.css";

const ToastNotification = ({ message, show, onClose, variant }) => {
  const validVariants = ["success", "danger", "warning", "info", "primary"];
  const sanitizedVariant = validVariants.includes(variant) ? variant : "info"; // Default to 'info' if invalid or not provided

  let title;

  // Determine the title based on the sanitized variant
  switch (sanitizedVariant) {
    case "success":
      title = "Thành Công"; // "Success" in Vietnamese
      break;
    case "danger":
      title = "Lỗi"; // "Error" in Vietnamese
      break;
    case "warning":
      title = "Cảnh báo"; // "Warning" in Vietnamese
      break;
    case "info":
      title = "Thông tin"; // "Information" in Vietnamese
      break;
    case "primary":
      title = "Thông báo"; // "Notice" in Vietnamese
      break;
    default:
      title = "Thông báo"; // Default title
  }

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        onClose={onClose}
        show={show}
        delay={3000}
        autohide
        bg={sanitizedVariant}
      >
        <Toast.Header>
          <strong className="me-auto">{title}</strong>
          <small className="text-muted">Vừa xong</small> {/* "Just now" */}
        </Toast.Header>
        <Toast.Body className={`text-white`}>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

ToastNotification.propTypes = {
  message: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["success", "danger", "warning", "info", "primary"]),
};

export default ToastNotification;
