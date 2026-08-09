import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Layouts
import { AdminLayout } from "../layouts/AdminLayout";
import { UserLayout } from "../layouts/UserLayout";

// Auth Pages
import { AdminLogin } from "../pages/auth/AdminLogin";
import { UserLogin } from "../pages/auth/UserLogin";

// Admin Pages
import { AdminDashboard } from "../pages/admin/Dashboard";
import { Users } from "../pages/admin/Users";

// User Pages
import { UserDashboard } from "../pages/user/Dashboard";
import { DocumentList } from "../pages/documents/DocumentList";
import { UploadDocument } from "../pages/documents/UploadDocument";
import { DocumentEditor } from "../pages/documents/DocumentEditor";
import { SignerRoleList } from "../pages/signerRoles/SignerRoleList";
import { useAuth } from "../hooks/useAuth";

const RootRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/user/login" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Path Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/login" element={<UserLogin />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* User Protected Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="documents" element={<DocumentList />} />
        <Route path="documents/upload" element={<UploadDocument />} />
        <Route path="documents/:id/editor" element={<DocumentEditor />} />
        <Route path="signer-roles" element={<SignerRoleList />} />
        <Route path="profile" element={<UserDashboard />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
