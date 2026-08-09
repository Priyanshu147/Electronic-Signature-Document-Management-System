# 📄 Electronic Signature Document Management System - Complete API Specification (`API.md`)

This document provides a complete, production-grade REST API specification for the **Electronic Signature Document Management System**.

---

## 📌 Base Configuration
- **Base URL**: `http://localhost:8000`
- **Protocol**: `HTTP / HTTPS`
- **Data Format**: `JSON` (for standard requests), `multipart/form-data` (for file uploads)

---

## 🔒 Authentication & Headers

### Authentication Flow
The system uses **JWT (JSON Web Token)** authentication combined with **HTTP-only Cookies** and Bearer token fallback.
- Upon successful authentication via `/user/login` or `/admin/login`, the server returns a JWT access token in the response payload (`data.token`) and sets HTTP-only session cookies.
- For protected endpoints, pass the access token in the standard HTTP `Authorization` header:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Request Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `string` | Yes (for JSON) | Must be `application/json` (or `multipart/form-data` for upload) |
| `Authorization` | `string` | Yes (for protected) | `Bearer <access_token>` |

---

## 📑 API Routes Index

### 1. User Auth Module (`/user`)
| Method | Route Path | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/user/login` | Public | Authenticate regular user |
| `GET` | `/user/profile` | User | Retrieve current user profile |
| `POST` | `/user/reset-password` | User | Change user account password |
| `POST` | `/user/logout` | User | Terminate user session |

### 2. Document Management Module (`/document`)
| Method | Route Path | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/document/upload` | User | Upload PDF file (`multipart/form-data`) |
| `GET` | `/document/documents` | User | Retrieve paginated, filtered & sorted documents |
| `GET` | `/document/documents/:id` | User | Retrieve single document metadata by ID |
| `PUT` | `/document/documents/:id` | User | Update document title or status |
| `DELETE` | `/document/documents/:id` | User | Delete document |
| `GET` | `/document/download/:id` | User | Download compiled PDF (`?raw=true` for unburned PDF) |
| `GET` | `/document/documents/:id/signature-fields` | User | Retrieve signature field placements for document |
| `PUT` | `/document/documents/:id/signature-fields` | User | Save/replace signature field placements |

### 3. Signer Role Module (`/signer-role`)
| Method | Route Path | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/signer-role/signer-roles` | User | Create a new custom signer role |
| `GET` | `/signer-role/signer-roles` | User | List all available signer roles |
| `GET` | `/signer-role/signer-roles/:id` | User | Get single signer role details by ID |
| `PUT` | `/signer-role/signer-roles/:id` | User | Update signer role details |
| `DELETE` | `/signer-role/signer-roles/:id` | User | Delete signer role |

### 4. Admin Management Module (`/admin`)
| Method | Route Path | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/login` | Public | Authenticate administrator |
| `GET` | `/admin/dashboard` | Admin | Retrieve system overview statistics |
| `GET` | `/admin/profile` | Admin | Retrieve administrator profile |
| `POST` | `/admin/reset-password` | Admin | Reset administrator password |
| `GET` | `/admin/users` | Admin | Retrieve paginated, filtered & sorted users list |
| `POST` | `/admin/users` | Admin | Create a new system user |
| `GET` | `/admin/users/:id` | Admin | Retrieve user details by ID |
| `PUT` | `/admin/users/:id` | Admin | Update user details, status, or password |
| `DELETE` | `/admin/users/:id` | Admin | Soft delete user account |
| `POST` | `/admin/logout` | Admin | Terminate administrator session |

---

## 📖 Detailed Endpoint Documentation

---

### 🔑 1. USER AUTHENTICATION MODULE

#### 1.1 User Login
- **HTTP Method**: `POST`
- **Path**: `/user/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Validation Rules**:
  - `email`: Required, valid email string.
  - `password`: Required, minimum 8 characters.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Invalid credentials.

---

#### 1.2 Get User Profile
- **HTTP Method**: `GET`
- **Path**: `/user/profile`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "Active",
    "created_at": "2026-08-09T10:00:00.000Z"
  }
}
```

---

#### 1.3 User Reset Password
- **HTTP Method**: `POST`
- **Path**: `/user/reset-password`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### 1.4 User Logout
- **HTTP Method**: `POST`
- **Path**: `/user/logout`
- **Access**: Protected (`User`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### 📂 2. DOCUMENT MANAGEMENT MODULE

#### 2.1 Upload PDF Document
- **HTTP Method**: `POST`
- **Path**: `/document/upload`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Fields**:
  - `file`: PDF binary file (Max size: 5MB, format: `.pdf`).
  - `documentName`: String (e.g. `"Sales Agreement 2026"`).
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": 12,
    "document_name": "Sales Agreement 2026",
    "original_file_name": "sales_contract.pdf",
    "file_size": 245120,
    "page_count": 3,
    "status": "Draft",
    "created_at": "2026-08-09T15:20:00.000Z"
  }
}
```

---

#### 2.2 Get Documents (Paginated, Filtered & Sorted)
- **HTTP Method**: `GET`
- **Path**: `/document/documents`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (`integer`, optional, default: `1`): Current page number.
  - `limit` (`integer`, optional, default: `10`): Number of records per page.
  - `searchText` (`string`, optional): Search term for document title or owner name.
  - `status` (`string`, optional): Filter status (`Draft`, `In Progress`, `Completed`, `Archived`).
  - `sortBy` (`string`, optional, default: `"created_at"`): Sort column (`document_name`, `uploaded_by`, `status`, `created_at`, `file_size`, `number_of_signers`).
  - `sortOrder` (`string`, optional, default: `"desc"`): Sort direction (`asc`, `desc`).
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "documents": [
    {
      "id": 12,
      "document_name": "Sales Agreement 2026",
      "original_file_name": "sales_contract.pdf",
      "file_size": 245120,
      "page_count": 3,
      "status": "In Progress",
      "created_at": "2026-08-09T15:20:00.000Z",
      "uploaded_by": "John Doe",
      "number_of_signers": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 1,
    "totalPages": 1
  }
}
```

---

#### 2.3 Get Document By ID
- **HTTP Method**: `GET`
- **Path**: `/document/documents/:id`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameters**:
  - `id`: `integer` (Document ID).
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 12,
    "uploaded_by": 1,
    "document_name": "Sales Agreement 2026",
    "original_file_name": "sales_contract.pdf",
    "stored_file_name": "1770650400-abc123.pdf",
    "file_path": "uploads/1770650400-abc123.pdf",
    "file_size": 245120,
    "page_count": 3,
    "status": "In Progress",
    "created_at": "2026-08-09T15:20:00.000Z",
    "updated_at": "2026-08-09T15:25:00.000Z"
  }
}
```

---

#### 2.4 Update Document Details
- **HTTP Method**: `PUT`
- **Path**: `/document/documents/:id`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "documentName": "Updated Agreement Title 2026",
  "status": "Completed"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Document updated successfully"
}
```

---

#### 2.5 Delete Document
- **HTTP Method**: `DELETE`
- **Path**: `/document/documents/:id`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

#### 2.6 Download PDF Document
- **HTTP Method**: `GET`
- **Path**: `/document/download/:id`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `raw` (`boolean`, optional, default: `false`): If `true`, returns clean original unburned PDF file; if `false`, returns compiled PDF with embedded signature boxes.
- **Success Response (200 OK)**: Binary stream (`application/pdf` header with attachment file disposition).

---

#### 2.7 Get Placed Signature Fields for Document
- **HTTP Method**: `GET`
- **Path**: `/document/documents/:id/signature-fields`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "page_number": 1,
      "x_position": 120.5,
      "y_position": 450.0,
      "width": 180.0,
      "height": 60.0,
      "required": true,
      "signer_role_id": 1,
      "role_name": "Client / Buyer"
    }
  ]
}
```

---

#### 2.8 Save / Replace Signature Fields
- **HTTP Method**: `PUT`
- **Path**: `/document/documents/:id/signature-fields`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "fields": [
    {
      "signerRoleId": 1,
      "pageNumber": 1,
      "xPosition": 120.5,
      "yPosition": 450.0,
      "width": 180.0,
      "height": 60.0,
      "required": true
    }
  ]
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Signature fields saved successfully"
}
```

---

### 🏷 3. SIGNER ROLE MODULE

#### 3.1 Create Signer Role
- **HTTP Method**: `POST`
- **Path**: `/signer-role/signer-roles`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "roleName": "Client / Buyer",
  "description": "Primary signing party responsible for contract execution"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roleName": "Client / Buyer",
    "description": "Primary signing party responsible for contract execution"
  }
}
```

---

#### 3.2 Get All Signer Roles
- **HTTP Method**: `GET`
- **Path**: `/signer-role/signer-roles`
- **Access**: Protected (`User`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "role_name": "Client / Buyer",
      "description": "Primary signing party responsible for contract execution",
      "created_at": "2026-08-09T12:00:00.000Z"
    }
  ]
}
```

---

#### 3.3 Get Signer Role By ID
- **HTTP Method**: `GET`
- **Path**: `/signer-role/signer-roles/:id`
- **Access**: Protected (`User`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "role_name": "Client / Buyer",
    "description": "Primary signing party responsible for contract execution"
  }
}
```

---

#### 3.4 Update Signer Role
- **HTTP Method**: `PUT`
- **Path**: `/signer-role/signer-roles/:id`
- **Access**: Protected (`User`)
- **Request Body**:
```json
{
  "roleName": "Primary Buyer",
  "description": "Updated description for primary buyer role"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Signer role updated successfully"
}
```

---

#### 3.5 Delete Signer Role
- **HTTP Method**: `DELETE`
- **Path**: `/signer-role/signer-roles/:id`
- **Access**: Protected (`User`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Signer role deleted successfully"
}
```

---

### 🛡 4. ADMIN MANAGEMENT MODULE

#### 4.1 Admin Login
- **HTTP Method**: `POST`
- **Path**: `/admin/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "fullName": "Administrator",
      "role": "admin"
    }
  }
}
```

---

#### 4.2 Get Admin Dashboard Stats
- **HTTP Method**: `GET`
- **Path**: `/admin/dashboard`
- **Access**: Protected (`Admin`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "activeUsers": 22,
    "inactiveUsers": 3,
    "totalDocuments": 142
  }
}
```

---

#### 4.3 Get All System Users (Paginated & Sorted)
- **HTTP Method**: `GET`
- **Path**: `/admin/users`
- **Access**: Protected (`Admin`)
- **Query Parameters**:
  - `page` (`integer`, default: `1`)
  - `limit` (`integer`, default: `10`)
  - `searchText` (`string`, optional): Search name or email.
  - `status` (`string`, optional): `Active` or `Inactive`.
  - `sortBy` (`string`, default: `"created_at"`): `full_name`, `email`, `status`, `created_at`.
  - `sortOrder` (`string`, default: `"desc"`): `asc` or `desc`.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "users": [
    {
      "id": 5,
      "full_name": "Alice Smith",
      "email": "alice@company.com",
      "status": "Active",
      "last_login": "2026-08-09T20:30:00.000Z",
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

#### 4.4 Create System User
- **HTTP Method**: `POST`
- **Path**: `/admin/users`
- **Access**: Protected (`Admin`)
- **Request Body**:
```json
{
  "fullName": "Alice Smith",
  "email": "alice@company.com",
  "password": "Password123!",
  "status": "Active"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "full_name": "Alice Smith",
    "email": "alice@company.com",
    "status": "Active",
    "created_at": "2026-08-09T22:00:00.000Z"
  }
}
```

---

#### 4.5 Update System User Details
- **HTTP Method**: `PUT`
- **Path**: `/admin/users/:id`
- **Access**: Protected (`Admin`)
- **Request Body**:
```json
{
  "fullName": "Alice Smith Updated",
  "email": "alice.updated@company.com",
  "password": "NewSecurePassword123!",
  "status": "Inactive"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 5,
    "full_name": "Alice Smith Updated",
    "email": "alice.updated@company.com",
    "status": "Inactive"
  }
}
```

---

#### 4.6 Delete System User
- **HTTP Method**: `DELETE`
- **Path**: `/admin/users/:id`
- **Access**: Protected (`Admin`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## ❌ Standard Error Status Codes & Response Payloads

All error responses strictly follow the standard JSON payload structure:

```json
{
  "success": false,
  "message": "Description of error failure",
  "errors": []
}
```

### Summary of HTTP Error Codes
| Status Code | Reason | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | Validation Error | Request body or query string parameters failed Zod validation |
| `401 Unauthorized` | Invalid Authentication | Missing or expired JWT token, or incorrect credentials |
| `403 Forbidden` | Access Denied | Authenticated account lacks permission for role-restricted route |
| `404 Not Found` | Resource Missing | Document, User, or Signer Role with given ID does not exist |
| `409 Conflict` | Duplicate Entry | Email or Signer Role name already exists in database |
| `500 Internal Error` | Server Failure | Unhandled server exception or database failure |
