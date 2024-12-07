// src/components/ToastNotification/ToastNotification.jsx

import React, { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import PropTypes from "prop-types";
import "./ToastNotification.css"; // For any additional custom styles

const ToastNotification = ({ message, show, onClose, variant, actions }) => {
  const [showToast, setShowToast] = useState(show);

  useEffect(() => {
    setShowToast(show);
  }, [show]);

  const validVariants = ["success", "danger", "warning", "info"];
  const sanitizedVariant = validVariants.includes(variant) ? variant : "info"; // Default to 'info'

  // Determine icon and color based on variant
  const getVariantDetails = (type) => {
    switch (type) {
      case "success":
        return { icon: "fas fa-check-circle", color: "text-success" };
      case "danger":
        return { icon: "fas fa-times-circle", color: "text-danger" };
      case "warning":
        return { icon: "fas fa-exclamation-triangle", color: "text-warning" };
      case "info":
      default:
        return { icon: "fas fa-info-circle", color: "text-info" };
    }
  };

  const { icon, color } = getVariantDetails(sanitizedVariant);

  // Determine title based on variant
  const getTitle = (type) => {
    switch (type) {
      case "success":
        return "Thành Công"; // "Success" in Vietnamese
      case "danger":
        return "Lỗi"; // "Error" in Vietnamese
      case "warning":
        return "Cảnh báo"; // "Warning" in Vietnamese
      case "info":
        return "Thông tin"; // "Information" in Vietnamese
      default:
        return "Thông báo"; // "Notice" in Vietnamese
    }
  };

  const title = getTitle(sanitizedVariant);

  // Handle close with transition
  const handleClose = () => {
    setShowToast(false);
    // Call the onClose prop after the transition duration (300ms)
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast
        onClose={handleClose}
        show={showToast}
        delay={3000}
        autohide
        bg="dark"
        className="d-flex align-items-start"
      >
        {/* Icon */}
        <div className={`${color} me-2 mt-1`}>
          <i className={`${icon} fa-lg`}></i>
        </div>

        {/* Content */}
        <div className="flex-grow-1">
          <Toast.Header className="border-0">
            <strong className="me-auto">{title}</strong>
            <small className="text-muted">Vừa xong</small> {/* "Just now" */}
          </Toast.Header>
          <Toast.Body className="text-white">
            {message.length > 100 ? `${message.substring(0, 100)}...` : message}
            {/* Action Buttons */}
            {actions && actions.length > 0 && (
              <div className="mt-2 d-flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="btn btn-link text-primary p-0 me-3"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </Toast.Body>
        </div>

        {/* Close Button */}
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          aria-label="Close"
          onClick={handleClose}
        ></button>
      </Toast>
    </ToastContainer>
  );
};

ToastNotification.propTypes = {
  message: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["success", "danger", "warning", "info"]),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ),
};

export default ToastNotification;
