import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type {
  CreateSignerRolePayload,
  SignerRoleItem,
  SignerRoleListResponse,
  UpdateSignerRolePayload,
} from "../types/signerRole.types";

export const signerRoleApi = {
  getSignerRoles: async (): Promise<SignerRoleListResponse> => {
    const response = await api.get<SignerRoleListResponse>(ENDPOINTS.SIGNER_ROLE.BASE);
    return response.data;
  },

  getSignerRoleById: async (id: number): Promise<SignerRoleItem> => {
    const response = await api.get<SignerRoleItem>(ENDPOINTS.SIGNER_ROLE.BY_ID(id));
    return response.data;
  },

  createSignerRole: async (payload: CreateSignerRolePayload): Promise<SignerRoleItem> => {
    const response = await api.post<SignerRoleItem>(ENDPOINTS.SIGNER_ROLE.BASE, payload);
    return response.data;
  },

  updateSignerRole: async (id: number, payload: UpdateSignerRolePayload): Promise<SignerRoleItem> => {
    const response = await api.put<SignerRoleItem>(ENDPOINTS.SIGNER_ROLE.BY_ID(id), payload);
    return response.data;
  },

  deleteSignerRole: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      ENDPOINTS.SIGNER_ROLE.BY_ID(id)
    );
    return response.data;
  },
};
