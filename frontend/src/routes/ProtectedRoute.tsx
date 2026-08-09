import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!user || !role) {
    const redirectPath = requiredRole === "admin" ? "/admin/login" : "/user/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const redirectPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
