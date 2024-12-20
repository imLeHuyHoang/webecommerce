// AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthAdmin } from "../../context/AuthAdminContext";

const AdminRoute = () => {
  const { authAdmin } = useAuthAdmin();
  const { admin, isLoading } = authAdmin;

  if (isLoading) {
    return null;
  }

  return admin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
