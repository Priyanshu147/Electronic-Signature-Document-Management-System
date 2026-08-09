export interface UserItem {
  id: number;
  email: string;
  full_name: string;
  status: "Active" | "Inactive";
  last_login?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  status?: "Active" | "Inactive";
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  status: "Active" | "Inactive";
  password?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
}

export interface UserListResponse {
  success: boolean;
  users: UserItem[];
  total: number;
  page: number;
  limit: number;
}
