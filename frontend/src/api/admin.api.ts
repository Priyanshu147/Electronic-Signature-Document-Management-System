import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
  UserItem,
  UserListResponse,
} from "../types/user.types";

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const adminApi = {
  getDashboardStats: async (): Promise<{ success: boolean; data: AdminDashboardStats }> => {
    const response = await api.get<{ success: boolean; data: AdminDashboardStats }>(
      ENDPOINTS.ADMIN.DASHBOARD
    );
    return response.data;
  },

  getAdminProfile: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get(ENDPOINTS.ADMIN.PROFILE);
    return response.data;
  },

  getUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return response.data;
  },

  getUserById: async (id: number): Promise<{ success: boolean; data: UserItem }> => {
    const response = await api.get<{ success: boolean; data: UserItem }>(
      ENDPOINTS.ADMIN.USER_BY_ID(id)
    );
    return response.data;
  },

  createUser: async (
    payload: CreateUserPayload
  ): Promise<{ success: boolean; message: string; data: UserItem }> => {
    const response = await api.post(ENDPOINTS.ADMIN.USERS, payload);
    return response.data;
  },

  updateUser: async (
    id: number,
    payload: UpdateUserPayload
  ): Promise<{ success: boolean; message: string; data: UserItem }> => {
    const response = await api.put(ENDPOINTS.ADMIN.USER_BY_ID(id), payload);
    return response.data;
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  resetAdminPassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post("/admin/reset-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};
