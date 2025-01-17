// src/context/ToastContext.js

import React, { createContext, useState, useCallback } from "react";
import ToastNotification from "./ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ToastStyles.css";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = "info", actions = []) => {
    const id = Date.now() + Math.random();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, variant, actions },
    ]);
  }, []);

  // Function to remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
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
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
