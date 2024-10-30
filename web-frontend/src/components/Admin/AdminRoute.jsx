// AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthAdmin } from "../../context/AuthAdminContext";

const AdminRoute = () => {
  const { authAdmin } = useAuthAdmin();
  const { admin, isLoading } = authAdmin;

  if (isLoading) {
    // Bạn có thể hiển thị spinner hoặc placeholder trong lúc chờ
    return null; // Hoặc <LoadingSpinner />
  }

  return admin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
