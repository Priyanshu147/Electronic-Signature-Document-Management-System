import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type { LoginResponse, ProfileResponse } from "../types/auth.types";

export const authApi = {
  adminLogin: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.ADMIN.LOGIN, data);
    return response.data;
  },

  adminLogout: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.ADMIN.LOGOUT);
    return response.data;
  },

  getAdminProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(ENDPOINTS.ADMIN.PROFILE);
    return response.data;
  },

  userLogin: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.USER.LOGIN, data);
    return response.data;
  },

  userLogout: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.USER.LOGOUT);
    return response.data;
  },

  getUserProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(ENDPOINTS.USER.PROFILE);
    return response.data;
  },
};
