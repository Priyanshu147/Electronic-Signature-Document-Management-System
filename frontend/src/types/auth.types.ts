export type UserRole = "admin" | "user";

export interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  role: UserRole;
  status?: string;
  lastLogin?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    id: number;
    email: string;
    full_name?: string;
    status?: string;
    last_login?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
