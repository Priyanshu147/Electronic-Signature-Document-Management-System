export type UserStatus = "Active" | "Inactive";

export interface UserItem {
  id: number;
  full_name: string;
  email: string;
  status: UserStatus;
  last_login?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserListResponse {
  success: boolean;
  users: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  status: UserStatus;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}
