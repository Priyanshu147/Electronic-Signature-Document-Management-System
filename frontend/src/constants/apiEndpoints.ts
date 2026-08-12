export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const ENDPOINTS = {
  ADMIN: {
    LOGIN: "/admin/login",
    LOGOUT: "/admin/logout",
    PROFILE: "/admin/profile",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER_BY_ID: (id: number) => `/admin/users/${id}`,
    RESET_PASSWORD: "/admin/reset-password",
  },
  USER: {
    LOGIN: "/user/login",
    LOGOUT: "/user/logout",
    PROFILE: "/user/profile",
    RESET_PASSWORD:"/user/reset-password",
  },
  SIGNER_ROLE: {
    BASE: "/signer-role/signer-roles",
    BY_ID: (id: number) => `/signer-role/signer-roles/${id}`,
  },
  DOCUMENT: {
    UPLOAD: "/document/upload",
    DOCUMENTS: "/document/documents",
    BY_ID: (id: number) => `/document/documents/${id}`,
    DOWNLOAD: (id: number) => `/document/download/${id}`,
    SIGNATURE_FIELDS: (id: number) => `/document/documents/${id}/signature-fields`,
  },
};
