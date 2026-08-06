// src/utils/constants.ts

import dotenv from "dotenv";

dotenv.config();


/* ===========================================================
    USER ROLES
=========================================================== */

export const USER_ROLE = {
    ADMIN: "admin",
    USER: "user",
} as const;

/* ===========================================================
   DATABASE
=========================================================== */

export const DB_CONFIG = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
};

/* ===========================================================
   BASE ROUTES
=========================================================== */

export const BASE_ROUTE = {
    AUTH: "/auth",
    ADMIN: "/admin",
    USER: "/user",
    DOCUMENT: "/document",
    UPLOADS: "/uploads",
    SIGNER_ROLE: "/signer-role",
};

/* ===========================================================
   AUTH ROUTES
=========================================================== */

export const AUTH_ROUTES = {
    ADMIN_LOGIN: "/admin/login",
    USER_LOGIN: "/user/login",
    LOGOUT: "/logout",
    REFRESH_TOKEN: "/refresh-token",
};

/* ===========================================================
   ADMIN ROUTES
=========================================================== */

export const ADMIN_ROUTES = {

    LOGIN: "/login",
    LOGOUT: "/logout",

    DASHBOARD: "/dashboard",
    PROFILE: "/profile",

    CREATE_USER: "/users",
    GET_USERS: "/users",
    GET_USER: "/users/:id",
    UPDATE_USER: "/users/:id",
    DELETE_USER: "/users/:id",
};

/* ===========================================================
   USER ROUTES
=========================================================== */

export const USER_ROUTES = {
    LOGIN: "/login",
    LOGOUT: "/logout",

    DASHBOARD: "/dashboard",

    DOCUMENTS: "/documents",

    UPLOAD_DOCUMENT: "/documents/upload",


    PROFILE: "/profile",

    GET_DOCUMENTS: "/documents",

    GET_DOCUMENT: "/documents/:id",
    UPDATE_DOCUMENT: "/documents/:id",
    DELETE_DOCUMENT: "/documents/:id",
};

/* ===========================================================
   DOCUMENT ROUTES
=========================================================== */

export const DOCUMENT_ROUTES = {
    UPLOAD: "/upload",

    GET_ALL: "/",

    GET_BY_ID: "/:id",

    UPDATE: "/:id",

    DELETE: "/document/:id",

    DOWNLOAD: "/download/:id",

    SAVE_SIGNATURE_FIELDS: "/:id/signature-fields",

    GET_SIGNATURE_FIELDS: "/:id/signature-fields",
};

/* ===========================================================
   SIGNER ROLE ROUTES
=========================================================== */

export const SIGNER_ROLE_ROUTES = {
    CREATE: "/signer-roles",
    GET_ALL: "/signer-roles",
    GET_BY_ID: "/signer-roles/:id",
    UPDATE: "/signer-roles/:id",
    DELETE: "/signer-roles/:id",
};

/* ===========================================================
   DATABASE TABLES
=========================================================== */

export const TABLES = {
    ADMIN: "admin",
    USER: "users",
    DOCUMENT: "documents",
    SIGNATURE_FIELD: "signature_fields",
    SIGNER_ROLE:"signer_roles",
    DOCUMENT_SIGNER_FIELDS: "document_signer_fields",
};

/* ===========================================================
   JWT
=========================================================== */

export const TOKEN_NAMES = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
};

export const ACCESS_TOKEN_EXPIRY = "15m";

export const REFRESH_TOKEN_EXPIRY = "7d";

/* ===========================================================
   UPLOAD CONFIG
=========================================================== */

export const FILE_UPLOAD = {
    PATH: "uploads/",

    MAX_SIZE: 20 * 1024 * 1024,

    ALLOWED_TYPES: [
        "application/pdf",
    ],
};

/* ===========================================================
   PAGINATION
=========================================================== */

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_PAGE_SIZE = 100;

/* ===========================================================
   USER STATUS
=========================================================== */

export const USER_STATUS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
} as const;

/* ===========================================================
   DOCUMENT STATUS
=========================================================== */

export const DOCUMENT_STATUS = {
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    ARCHIVED: "Archived",
} as const;

/* ===========================================================
   FUTURE DOCUMENT PERMISSIONS
=========================================================== */

export const DOCUMENT_PERMISSION = {
    VIEW: "VIEW",
    EDIT: "EDIT",
} as const;

/* ===========================================================
   HTTP STATUS
=========================================================== */

export const HTTP_STATUS = {
    OK: 200,

    CREATED: 201,

    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    CONFLICT: 409,

    UNPROCESSABLE_ENTITY: 422,

    INTERNAL_SERVER_ERROR: 500,
};

/* ===========================================================
   ERROR MESSAGES
=========================================================== */

export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Unauthorized access.",

    FORBIDDEN: "Access forbidden.",

    INVALID_CREDENTIALS: "Invalid email or password.",

    INVALID_PASSWORD: "Invalid password.",

    USER_NOT_FOUND: "User not found.",

    ADMIN_NOT_FOUND: "Admin not found.",

    DOCUMENT_NOT_FOUND: "Document not found.",

    DUPLICATE_EMAIL: "Email already exists.",

    FILE_REQUIRED: "Please upload a PDF document.",

    INVALID_FILE_TYPE: "Only PDF files are allowed.",

    FILE_TOO_LARGE: "File size exceeds the allowed limit.",

    DATABASE_ERROR: "Database operation failed.",

    TOKEN_EXPIRED: "Token expired.",

    INVALID_TOKEN: "Invalid token.",

    INTERNAL_SERVER_ERROR: "Internal server error.",

    RESOURCE_NOT_FOUND: "Resource not found.",
};

/* ===========================================================
   SUCCESS MESSAGES
=========================================================== */

export const SUCCESS_MESSAGES = {
    LOGIN: "Login successful.",

    LOGOUT: "Logout successful.",

    USER_CREATED: "User created successfully.",

    USER_UPDATED: "User updated successfully.",

    USER_DELETED: "User deleted successfully.",

    DOCUMENT_UPLOADED: "Document uploaded successfully.",

    DOCUMENT_UPDATED: "Document updated successfully.",

    DOCUMENT_DELETED: "Document deleted successfully.",

    SIGNATURE_SAVED: "Signature fields saved successfully.",
};