import dotenv from "dotenv";

dotenv.config();

// Database
export const DB_CONFIG = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
};

// Base Routes
export const BASE_ROUTE = {
    ADMIN: "/admin",
    USER: "/user",
    DOCUMENT: "/document",
    UPLOADS: "/uploads",
};

// API Routes


export const ADMIN_ROUTES = {
  LOGIN: "/login",
  LOGOUT: "/logout",

  PROFILE: "/profile",
  DASHBOARD: "/dashboard",

  CREATE_USER: "/users",
  GET_USERS: "/users",
  GET_USER: "/users/:id",
  UPDATE_USER: "/users/:id",
  DELETE_USER: "/users/:id",
};

export const USER_ROUTES = {
    LOGIN: "/login",
    CREATE: "/",
    GET_ALL: "/",
    GET_BY_ID: "/:id",
    UPDATE: "/:id",
    DELETE: "/:id",
};

export const DOCUMENT_ROUTES = {
    UPLOAD: "/upload",
    GET_ALL: "/",
    GET_BY_ID: "/:id",
    UPDATE: "/:id",
    DELETE: "/:id",
    DOWNLOAD: "/download/:id",
};


// Table Names
export const TABLES = {
    ADMIN: "admin",
    USER: "users",
    DOCUMENT: "documents",
};


// JWT
export const TOKEN_NAMES = {
    ACCESS_TOKEN: "accessToken",
};

export const ACCESS_TOKEN_EXPIRY = "1d";

// Upload
export const FILE_UPLOAD = {
    PATH: "uploads/",
    MAX_SIZE: 20 * 1024 * 1024, //20MB
};

// Messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Unauthorized Access",
    FORBIDDEN: "Access Forbidden",
    API_KEY_REQUIRED: "Unauthorized: Api key Required",
    INVALID_API_KEY: "Access Forbidden: Invalid Api key",
    NOT_FOUND: "Resource Not Found",
    CONNECTION_ERROR: "Connection Error: Unable to connect to the database",
    AUTHENTICATION_FAILED: "Authentication Failed: Invalid credentials",
    SERVER_ERROR: "Server Error: An unexpected error occurred on the server",
    DATABASE_ERROR:
        "Database Error: An error occurred with the database operation",
    INSUFFICIENT_PRIVILEGES:
        "Insufficient Privileges: You do not have the necessary permissions",
    RESOURCE_NOT_FOUND:
        "Resource Not Found: The requested resource does not exist or may have been deleted.",
    OPERATION_FAILED:
        "Operation Failed: The requested operation could not be completed",
    BAD_REQUEST:
        "Bad Request: The request could not be understood or was missing required parameters",
    INTERNAL_SERVER_ERROR:
        "Internal Server Error: An unexpected error occurred on the server",
    DUPLICATE_RECORD: "Record already exists for {key}",
    INVALID_DETAILS: "Invalid login details Or User is not active",
    INVALID_PASSWORD: "Invalid password",
    TOKEN_EXPIRED: "Token Expired",
    LINKEDIN_USER_NOT_FOUND: "Error fetching LinkedIn user info {profile}",
    LINKEDIN_POST_FAILD: "Faild to post Description on LinkedIn",
    RESET_TOKEN_EXPIRE: "Token has been expired please try again.",
    ON_PASSWORD_CONFLICT: "Password is not matching with confirm password.",
};


export const SUCCESS_MESSAGES = {
    LOGIN: "Login successful.",
    USER_CREATED: "User created successfully.",
    DOCUMENT_UPLOADED: "Document uploaded successfully.",
};

// Status
export const USER_STATUS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
};

export const DOCUMENT_STATUS = {
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    ARCHIVED: "Archived",
};




export const DEFAULT_PAGE_SIZE = 10;