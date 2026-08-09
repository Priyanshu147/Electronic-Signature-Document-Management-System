export interface SignerRoleItem {
  id: number;
  role_name: string;
  description?: string;
}

export interface SignerRoleListResponse {
  success?: boolean;
  data: SignerRoleItem[];
}

export interface CreateSignerRolePayload {
  roleName: string;
  description?: string;
}

export interface UpdateSignerRolePayload {
  roleName?: string;
  description?: string;
}
