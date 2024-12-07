// src/context/ToastContext.js

import React, { createContext, useState, useEffect } from "react";
import ToastNotification from "./ToastNotification";
import "./ToastStyles.css"; // For any additional custom styles

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast
  const addToast = (message, variant = "info", actions = []) => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, variant, progress: 100, actions },
    ]);
  };

  // Function to remove a toast by id
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Progress management: decrease progress over time
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prevToasts) =>
        prevToasts
          .map((toast) => ({
            ...toast,
            progress: toast.progress > 0 ? toast.progress - 1 : 0,
          }))
          .filter((toast) => toast.progress > 0)
      );
    }, 30); // Update every 30ms for smoother progress

    return () => clearInterval(interval);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            show={true}
            onClose={() => removeToast(toast.id)}
            variant={toast.variant}
            actions={toast.actions}
            progress={toast.progress}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
