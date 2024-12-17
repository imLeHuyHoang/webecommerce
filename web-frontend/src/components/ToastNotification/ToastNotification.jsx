import React, { useEffect, useState } from "react";
import { Toast } from "react-bootstrap";
import PropTypes from "prop-types";
import "./ToastNotification.css"; // Để thêm các kiểu tùy chỉnh

const ToastNotification = ({ message, show, onClose, variant, actions }) => {
  const [showToast, setShowToast] = useState(show);

  useEffect(() => {
    setShowToast(show);
  }, [show]);

  const validVariants = ["success", "danger", "warning", "info"]; //variants: định nghĩa là các loại thông báo hợp lệ
  const sanitizedVariant = validVariants.includes(variant) ? variant : "info"; // Mặc định là 'info' nếu variant không hợp lệ

  // Xác định biểu tượng và màu sắc dựa trên variant
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

  // Xác định tiêu đề dựa trên variant
  const getTitle = (type) => {
    switch (type) {
      case "success":
        return "Thành Công";
      case "danger":
        return "Lỗi";
      case "warning":
        return "Cảnh báo";
      case "info":
        return "Thông tin";
      default:
        return "Thông báo";
    }
  };

  const title = getTitle(sanitizedVariant);

  // Xử lý đóng thông báo với hiệu ứng chuyển tiếp
  const handleClose = () => {
    setShowToast(false);
    // Gọi hàm onClose sau khi hiệu ứng chuyển tiếp kết thúc (300ms)
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Toast
      onClose={handleClose}
      show={showToast}
      delay={3000}
      autohide
      bg={sanitizedVariant}
      className={`toast-custom bg-${sanitizedVariant}`}
    >
      {/* Tiêu đề của Toast */}
      <Toast.Header className="border-0" closeButton={false}>
        <div className={`${color}`}>
          <i className={`${icon} fa-lg me-2`}></i>
        </div>
        <strong className="me-auto">{title}</strong>
        <small className="">Vừa xong</small>
      </Toast.Header>

      {/* Nội dung của Toast */}
      <Toast.Body>
        {message.length > 100 ? `${message.substring(0, 100)}...` : message}
        {/* Các nút hành động */}
        {actions && actions.length > 0 && (
          <div className="mt-2 d-flex">
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
    </Toast>
  );
};

ToastNotification.propTypes = {
  message: PropTypes.string.isRequired, // Nội dung thông báo
  show: PropTypes.bool.isRequired, // Trạng thái hiển thị thông báo
  onClose: PropTypes.func.isRequired, // Hàm xử lý khi đóng thông báo
  variant: PropTypes.oneOf(["success", "danger", "warning", "info"]), // Loại thông báo
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired, // Nhãn của nút hành động
      onClick: PropTypes.func.isRequired, // Hàm xử lý khi nhấn nút hành động
    })
  ),
};

export default ToastNotification;
