// ToastContext.js
import React, { createContext, useState, useEffect } from "react";
import { Toast, ToastContainer, ProgressBar } from "react-bootstrap";
import "./ToastStyles.css";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant) => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, variant, progress: 100 },
    ]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prevToasts) =>
        prevToasts
          .map((toast) => ({
            ...toast,
            progress: toast.progress - 1, // Giảm dần progress (100% / 60 lần trong 3 giây)
          }))
          .filter((toast) => toast.progress > 0)
      );
    }, 50); // Cập nhật mỗi 50ms

    return () => clearInterval(interval);
  }, []);

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer position="top-end" className="p-3 custom-toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            className={`custom-toast`}
            bg={toast.variant}
          >
            <Toast.Header className="custom-toast-header">
              <strong className="me-auto">Thông báo</strong>
            </Toast.Header>
            <Toast.Body className="custom-toast-body">
              {toast.message}
              <ProgressBar
                now={toast.progress}
                variant={toast.variant}
                className="toast-progress"
              />
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
