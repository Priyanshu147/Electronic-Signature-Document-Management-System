import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const userApi = {
  getUserProfile: async () => {
    const response = await api.get(ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  resetPassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post(ENDPOINTS.USER.RESET_PASSWORD, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};
