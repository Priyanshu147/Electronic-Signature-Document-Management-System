import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.api";
import type { AuthUser, UserRole } from "../types/auth.types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  userLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Try admin profile first
      const adminRes = await authApi.getAdminProfile();
      if (adminRes?.success && adminRes.data) {
        setUser({
          id: adminRes.data.id,
          email: adminRes.data.email,
          role: "admin",
          lastLogin: adminRes.data.last_login || undefined,
        });
        setRole("admin");
        setIsLoading(false);
        return;
      }
    } catch {
      // Admin profile failed, try user profile
      try {
        const userRes = await authApi.getUserProfile();
        if (userRes?.success && userRes.data) {
          setUser({
            id: userRes.data.id,
            email: userRes.data.email,
            fullName: userRes.data.full_name,
            role: "user",
            status: userRes.data.status,
            lastLogin: userRes.data.last_login || undefined,
          });
          setRole("user");
          setIsLoading(false);
          return;
        }
      } catch {
        // Neither authenticated
        setUser(null);
        setRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.adminLogin({ email, password });
      if (res.success) {
        toast.success("Admin login successful!");
        await checkAuth();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Admin login failed.");
      return false;
    }
  };

  const userLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.userLogin({ email, password });
      if (res.success) {
        toast.success("User login successful!");
        await checkAuth();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "User login failed.");
      return false;
    }
  };

  const logout = async () => {
    try {
      if (role === "admin") {
        await authApi.adminLogout();
      } else if (role === "user") {
        await authApi.userLogout();
      }
      toast.success("Logged out successfully.");
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        adminLogin,
        userLogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
