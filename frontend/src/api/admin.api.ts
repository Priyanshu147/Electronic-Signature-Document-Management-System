import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type {
  AdminDashboardData,
  CreateUserPayload,
  UpdateUserPayload,
  UserItem,
  UserListResponse,
} from "../types/user.types";

export const adminApi = {
  getDashboardStats: async (): Promise<{ success: boolean; data: AdminDashboardData }> => {
    const response = await api.get<{ success: boolean; data: AdminDashboardData }>(
      ENDPOINTS.ADMIN.DASHBOARD
    );
    return response.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    searchText?: string;
    status?: string | null;
  }): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  getUserById: async (id: number): Promise<{ success: boolean; data: UserItem }> => {
    const response = await api.get<{ success: boolean; data: UserItem }>(
      ENDPOINTS.ADMIN.USER_BY_ID(id)
    );
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<{ success: boolean; message: string; data: UserItem }> => {
    const response = await api.post<{ success: boolean; message: string; data: UserItem }>(
      ENDPOINTS.ADMIN.USERS,
      payload
    );
    return response.data;
  },

  updateUser: async (
    id: number,
    payload: UpdateUserPayload
  ): Promise<{ success: boolean; message: string; data: UserItem }> => {
    const response = await api.put<{ success: boolean; message: string; data: UserItem }>(
      ENDPOINTS.ADMIN.USER_BY_ID(id),
      payload
    );
    return response.data;
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      ENDPOINTS.ADMIN.USER_BY_ID(id)
    );
    return response.data;
  },
};
