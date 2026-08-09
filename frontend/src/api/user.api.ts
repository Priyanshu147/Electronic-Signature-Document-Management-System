import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type { ProfileResponse } from "../types/auth.types";

export const userApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(ENDPOINTS.USER.PROFILE);
    return response.data;
  },
};
