import api from "./axios";

export const userApi = {
  getUserProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  resetPassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post("/user/reset-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};
