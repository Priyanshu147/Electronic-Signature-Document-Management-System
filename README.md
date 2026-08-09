
# 📄 eSign — Electronic Signature Document Management System

**API Documentation**

---

## 📌 1. Project Overview

The **eSign Document Management System** is a backend service that allows organizations to upload PDF documents, define electronic signature fields on those documents, and route them to different signer roles (Buyer, Seller, Approver, Manager, Witness, etc.) for completion. The system is built with **Node.js**, **Express**, and **TypeScript**, backed by a **MySQL** database, and uses **JWT + HTTP-only cookie authentication** to secure all protected routes. File uploads (PDFs) are handled through **Multer**.

The system supports two distinct types of users:

| Role                | Responsibility                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🛡️**Admin** | Manages platform users — creating, updating, and deleting user accounts. Has visibility over the dashboard and administrative data. Authenticates through a separate admin login endpoint. |
| 👤**User**    | The primary actor who uploads documents, manages signer roles, places signature fields on PDF pages, and drives a document through the signing workflow.                                    |

> **Note:** Based on the attached Postman collection, only the endpoints that actually exist are documented below. No endpoints have been invented.

---

## 🔐 2. Authentication

The API uses **JWT (JSON Web Token)**-based authentication combined with **HTTP-only cookies** for session handling.

- **Access Token** — A short-lived JWT issued at login, used to authorize requests to protected endpoints.
- **Refresh Token** — A longer-lived JWT used to silently obtain a new access token once the access token expires, without forcing the user to log in again.
- **Cookies** — Tokens are set as HTTP-only cookies on login (`Set-Cookie` header), meaning the frontend does not need to manually attach an `Authorization` header — the browser/Postman automatically sends the cookie on subsequent requests.
- **Authentication Flow** — Login → server validates credentials → server issues access + refresh tokens → tokens stored in cookies → cookies sent automatically on every subsequent request → server validates token on protected routes → logout clears the cookies.

### Which APIs require authentication?

| API Group                                 | Authentication Required |
| ----------------------------------------- | ----------------------- |
| Admin Login                               | ❌ No (public)          |
| Admin Logout, Profile, Update/Delete User | ✅ Yes (Admin role)     |
| User Login                                | ❌ No (public)          |
| User Logout, Profile                      | ✅ Yes (User role)      |
| Signer Role APIs                          | ✅ Yes                  |
| Document APIs                             | ✅ Yes                  |

### Role-Based Access

| Role            | Access                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Admin** | Admin-only routes (`/admin/*`) — manage users, view dashboard                                                                  |
| **User**  | User-only routes (`/user/*`, `/document/*`, `/signer-role/*`) — upload documents, manage signer roles and signature fields |

> ⚠️ **Warning:** The Postman collection contains a minor inconsistency — the `Admin Profile` request uses the variable `{{baseURL}}` while all other requests use `{{base_url}}`. Ensure both environment variables are set (or standardize on one) before running the collection.

---

## 🌐 3. Base URL

```
http://localhost:8000
```

All endpoints below are relative to this base URL (represented in Postman as `{{base_url}}`).

---

## ⚙️ 4. Environment Variables

| Variable               | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `PORT`               | Port the Express server listens on (e.g.`8000`)   |
| `DB_HOST`            | MySQL database host                                 |
| `DB_PORT`            | MySQL database port                                 |
| `DB_USER`            | MySQL database username                             |
| `DB_PASSWORD`        | MySQL database password                             |
| `DB_NAME`            | MySQL database/schema name                          |
| `JWT_SECRET`         | Secret key used to sign JWT**access tokens**  |
| `JWT_REFRESH_SECRET` | Secret key used to sign JWT**refresh tokens** |

---

## 🗂️ 5. API Groups

| Group                                  | Description                                                    |
| -------------------------------------- | -------------------------------------------------------------- |
| [Authentication](#-authentication-apis) | Admin & User login/logout                                      |
| [Admin](#-admin-apis)                   | User management (Admin only)                                   |
| [User](#-user-apis)                     | User profile management                                        |
| [Documents](#-document-apis)            | Document upload, retrieval, update, deletion, signature fields |
| [Signer Roles](#-signer-role-apis)      | CRUD for signer roles (Buyer, Seller, Approver, etc.)          |

---

## 🔑 Authentication APIs

### POST `/admin/login`

**Description:** Authenticates an admin user and issues access/refresh tokens as cookies.

- **Authentication Required:** ❌ No
- **Role Required:** None
- **Headers:** `Content-Type: application/json`
- **Path Parameters:** None
- **Query Parameters:** None

**Request Body:**

```json
{
  "email": "admin@anblicks.com",
  "password": "12345678"
}
```

**Validation Rules:**

- `email` — required, must be a valid email format
- `password` — required, minimum length applies

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "id": 1,
    "email": "admin@anblicks.com",
    "role": "admin"
  }
}
```

**Error Responses**

```json
// 401 Unauthorized — invalid credentials
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

**Example Request:**

```http
POST /admin/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@anblicks.com",
  "password": "12345678"
}
```

**Notes:** On success, `accessToken` and `refreshToken` cookies are set by the server. These are automatically reused by Postman/browser for subsequent authenticated requests.

---

### POST `/admin/logout`

**Description:** Logs the currently authenticated admin out and clears authentication cookies.

- **Authentication Required:** ✅ Yes
- **Role Required:** Admin
- **Headers:** Cookie (auto-attached)
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Admin logged out successfully",
  "data": {}
}
```

**Error Responses**

```json
// 401 Unauthorized — no active session
{
  "success": false,
  "message": "Unauthorized. Please log in.",
  "errors": []
}
```

**Notes:** Clears `accessToken` / `refreshToken` cookies on the client.

---

### POST `/user/login`

**Description:** Authenticates a regular user and issues access/refresh tokens as cookies.

- **Authentication Required:** ❌ No
- **Role Required:** None
- **Headers:** `Content-Type: application/json`

**Request Body:**

```json
{
  "email": "priyanshu@gmail.com",
  "password": "12345678"
}
```

**Validation Rules:**

- `email` — required, valid email format
- `password` — required

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "id": 5,
    "email": "priyanshu@gmail.com",
    "role": "user"
  }
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

**Notes:** Sets authentication cookies identical in mechanism to the admin login flow.

---

### POST `/user/logout`

**Description:** Logs the currently authenticated user out and clears authentication cookies.

- **Authentication Required:** ✅ Yes
- **Role Required:** User

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "User logged out successfully",
  "data": {}
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized. Please log in.",
  "errors": []
}
```

---

## 🛡️ Admin APIs

### GET `/admin/profile`

**Description:** Retrieves the profile details of the currently logged-in admin.

- **Authentication Required:** ✅ Yes
- **Role Required:** Admin
- **Headers:** Cookie (auto-attached)

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Admin profile fetched successfully",
  "data": {
    "id": 1,
    "fullName": "Admin",
    "email": "admin@anblicks.com",
    "role": "admin"
  }
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized. Please log in.",
  "errors": []
}
```

> ⚠️ Note: This request in the Postman collection uses the environment variable `{{baseURL}}` instead of `{{base_url}}` — make sure this variable is also configured, or update it to match the rest of the collection.

---

### PUT `/admin/users/:id`

**Description:** Updates the details of a specific user (identified by ID). Only accessible to Admins.

- **Authentication Required:** ✅ Yes
- **Role Required:** Admin
- **Headers:** `Content-Type: application/json`, Cookie
- **Path Parameters:**

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `id`    | number | ID of the user to update |

**Request Body:**

```json
{
  "fullName": "Priyanshu Patel",
  "email": "priyanshu@gmail.com",
  "password": "12345678",
  "status": "Active"
}
```

**Validation Rules:**

- `fullName` — optional, string
- `email` — must be a valid, unique email if provided
- `password` — minimum length applies if provided
- `status` — must be one of the allowed status values (e.g. `Active`, `Inactive`)

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "fullName": "Priyanshu Patel",
    "email": "priyanshu@gmail.com",
    "status": "Active"
  }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "User not found",
  "errors": []
}

// 409 Conflict — email already in use
{
  "success": false,
  "message": "Email already exists",
  "errors": []
}
```

**Example Request:**

```http
PUT /admin/users/1 HTTP/1.1
Content-Type: application/json

{
  "fullName": "Priyanshu Patel",
  "email": "priyanshu@gmail.com",
  "password": "12345678",
  "status": "Active"
}
```

---

### DELETE `/admin/users/:id`

**Description:** Permanently deletes a user account.

- **Authentication Required:** ✅ Yes
- **Role Required:** Admin
- **Path Parameters:**

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `id`    | number | ID of the user to delete |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {}
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "User not found",
  "errors": []
}
```

---

## 👤 User APIs

### GET `/user/profile`

**Description:** Retrieves the profile of the currently logged-in user.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Headers:** Cookie (auto-attached)

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": 5,
    "fullName": "Priyanshu Patel",
    "email": "priyanshu@gmail.com",
    "role": "user"
  }
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized. Please log in.",
  "errors": []
}
```

---

## 📁 Document APIs

### POST `/document/upload`

**Description:** Uploads a new PDF document to the system.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Headers:** `Content-Type: multipart/form-data`, Cookie
- **Request Body (multipart/form-data):**

| Field            | Type | Required | Description                            |
| ---------------- | ---- | -------- | -------------------------------------- |
| `documentName` | text | ✅       | Display name for the uploaded document |
| `file`         | file | ✅       | The PDF file to upload                 |

**Validation Rules:**

- `documentName` — required, non-empty string
- `file` — required, **PDF only**, **maximum size 5 MB**

**Success Response — 201 Created**

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": 4,
    "documentName": "priyanshu",
    "original_file_name": "Priyanshu_Patel_Capstone_Project.pdf",
    "stored_file_name": "1699999999-a1b2c3d4.pdf",
    "file_path": "/uploads/documents/1699999999-a1b2c3d4.pdf",
    "status": "Pending"
  }
}
```

**Error Responses**

```json
// 400 Bad Request — wrong file type
{
  "success": false,
  "message": "Only PDF files are allowed",
  "errors": []
}

// 400 Bad Request — file too large
{
  "success": false,
  "message": "File size must not exceed 5 MB",
  "errors": []
}
```

**Notes on file storage:**

- `original_file_name` — the file name as uploaded by the client (kept for display purposes).
- `stored_file_name` — a server-generated, collision-safe file name used to physically store the file on disk (typically timestamp + random hash).
- `file_path` — the relative/absolute path where the file is persisted on the server's `uploads/` directory.

---

### GET `/document/documents/`

**Description:** Retrieves a paginated list of all documents belonging to the authenticated user.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Query Parameters (typical for a document listing endpoint):**

| Parameter  | Type   | Description                                                |
| ---------- | ------ | ---------------------------------------------------------- |
| `page`   | number | Page number for pagination                                 |
| `limit`  | number | Number of records per page                                 |
| `search` | string | Search documents by name                                   |
| `status` | string | Filter by document status (e.g.`Pending`, `Completed`) |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Documents fetched successfully",
  "data": {
    "documents": [
      {
        "id": 4,
        "documentName": "priyanshu",
        "uploaderName": "Priyanshu Patel",
        "status": "Pending",
        "numberOfSigners": 2,
        "pageCount": 3,
        "fileSize": "1.2 MB",
        "createdAt": "2026-08-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 1,
      "totalPages": 1
    }
  }
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized. Please log in.",
  "errors": []
}
```

---

### GET `/document/documents/:id`

**Description:** Retrieves the details of a single document by its ID.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| `id`    | number | ID of the document |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Document fetched successfully",
  "data": {
    "id": 4,
    "documentName": "priyanshu",
    "original_file_name": "Priyanshu_Patel_Capstone_Project.pdf",
    "file_path": "/uploads/documents/1699999999-a1b2c3d4.pdf",
    "status": "Pending",
    "pageCount": 3
  }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Document not found",
  "errors": []
}
```

---

### PUT `/document/documents/:id`

**Description:** Updates the name of an existing document.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `id`    | number | ID of the document to update |

**Request Body:**

```json
{
  "documentName": "Esign Project"
}
```

**Validation Rules:**

- `documentName` — required, non-empty string

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "id": 4,
    "documentName": "Esign Project"
  }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Document not found",
  "errors": []
}
```

---

### DELETE `/document/document/:id`

**Description:** Deletes a document and its associated file.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `id`    | number | ID of the document to delete |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {}
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Document not found",
  "errors": []
}
```

> ⚠️ **Note:** This endpoint's path is `/document/document/:id` (singular) while all other document endpoints use `/document/documents/` (plural). This inconsistency exists in the source Postman collection — verify against the actual backend route before integrating.

---

### GET `/document/documents/:id/signature-fields`

**Description:** Retrieves all signature fields currently saved for a document (used to reload the PDF editor with existing field placements).

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| `id`    | number | ID of the document |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signature fields fetched successfully",
  "data": {
    "documentId": 4,
    "fields": [
      {
        "id": 10,
        "signerRoleId": 3,
        "pageNumber": 1,
        "xPosition": 210,
        "yPosition": 340,
        "width": 180,
        "height": 60,
        "required": true
      },
      {
        "id": 11,
        "signerRoleId": 4,
        "pageNumber": 2,
        "xPosition": 420,
        "yPosition": 510,
        "width": 180,
        "height": 60,
        "required": true
      }
    ]
  }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Document not found",
  "errors": []
}
```

---

### PUT `/document/documents/:id/signature-fields`

**Description:** Saves or updates the signature field placements for a document. This is the endpoint used both for the initial "drag and drop" save and any subsequent edits.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| `id`    | number | ID of the document |

**Request Body:**

```json
{
  "fields": [
    {
      "signerRoleId": 3,
      "pageNumber": 1,
      "xPosition": 210,
      "yPosition": 340,
      "width": 180,
      "height": 60,
      "required": true
    },
    {
      "signerRoleId": 4,
      "pageNumber": 2,
      "xPosition": 420,
      "yPosition": 510,
      "width": 180,
      "height": 60,
      "required": true
    }
  ]
}
```

**Validation Rules:**

- `fields` — required, non-empty array
- `signerRoleId` — required, must reference an existing signer role
- `pageNumber` — required, positive integer, must not exceed the document's total page count
- `xPosition` / `yPosition` — required, numeric coordinates on the PDF page
- `width` / `height` — required, positive numbers
- `required` — boolean, whether the signer must fill this field before completing the document

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signature fields saved successfully",
  "data": {
    "documentId": 4,
    "fieldsSaved": 2
  }
}
```

**Error Responses**

```json
// 400 Bad Request
{
  "success": false,
  "message": "Invalid signature field data",
  "errors": ["pageNumber exceeds total document pages"]
}

// 404 Not Found
{
  "success": false,
  "message": "Document not found",
  "errors": []
}
```

---

## 🖋️ Signer Role APIs

### POST `/signer-role/signer-roles`

**Description:** Creates a new signer role (e.g. Buyer, Seller, Approver).

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Headers:** `Content-Type: application/json`

**Request Body:**

```json
{
  "roleName": "buyer",
  "description": "buyer"
}
```

**Validation Rules:**

- `roleName` — required, unique, non-empty string
- `description` — optional string

**Success Response — 201 Created**

```json
{
  "success": true,
  "message": "Signer role created successfully",
  "data": {
    "id": 3,
    "roleName": "buyer",
    "description": "buyer"
  }
}
```

**Error Responses**

```json
// 409 Conflict
{
  "success": false,
  "message": "Signer role already exists",
  "errors": []
}
```

---

### GET `/signer-role/signer-roles`

**Description:** Retrieves the full list of signer roles.

- **Authentication Required:** ✅ Yes
- **Role Required:** User

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signer roles fetched successfully",
  "data": [
    { "id": 1, "roleName": "buyer", "description": "buyer" },
    { "id": 2, "roleName": "seller", "description": "seller" }
  ]
}
```

---

### GET `/signer-role/signer-roles/:id`

**Description:** Retrieves a single signer role by its ID.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| `id`    | number | ID of the signer role |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signer role fetched successfully",
  "data": { "id": 1, "roleName": "buyer", "description": "buyer" }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Signer role not found",
  "errors": []
}
```

---

### PUT `/signer-role/signer-roles/:id`

**Description:** Updates an existing signer role's name and/or description.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| `id`    | number | ID of the signer role to update |

**Request Body:**

```json
{
  "roleName": "sender",
  "description": "sender"
}
```

**Validation Rules:**

- `roleName` — required, unique, non-empty string
- `description` — optional string

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signer role updated successfully",
  "data": { "id": 1, "roleName": "sender", "description": "sender" }
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Signer role not found",
  "errors": []
}
```

---

### DELETE `/signer-role/signer-roles/:id`

**Description:** Deletes a signer role.

- **Authentication Required:** ✅ Yes
- **Role Required:** User
- **Path Parameters:**

| Parameter | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| `id`    | number | ID of the signer role to delete |

**Success Response — 200 OK**

```json
{
  "success": true,
  "message": "Signer role deleted successfully",
  "data": {}
}
```

**Error Responses**

```json
// 404 Not Found
{
  "success": false,
  "message": "Signer role not found",
  "errors": []
}

// 409 Conflict — role is in use by existing signature fields
{
  "success": false,
  "message": "Cannot delete a signer role that is currently assigned to a document",
  "errors": []
}
```

---

## 📤 7. Document Upload

Document upload is handled via **`multipart/form-data`**, not JSON.

| Field            | Type       | Required |
| ---------------- | ---------- | -------- |
| `documentName` | text       | ✅       |
| `file`         | file (PDF) | ✅       |

- ✅ **PDF only** — any other MIME type is rejected with a `400` error.
- ✅ **Maximum size: 5 MB** — larger files are rejected with a `400` error.

### How uploaded files are stored

When a file is uploaded, the server (via Multer) does not keep the original file name on disk — instead it generates a unique storage name to avoid collisions, while preserving the original name for display:

| Field                  | Purpose                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `original_file_name` | The exact file name the client uploaded (e.g.`Priyanshu_Patel_Capstone_Project.pdf`) — shown to the user in the UI.                                     |
| `stored_file_name`   | A server-generated unique name (e.g. timestamp + hash) used as the actual file name on disk, preventing collisions between uploads.                        |
| `file_path`          | The path on the server's file system (typically under an`uploads/` directory) where the physical file is saved and later read from for download/preview. |

> 💡 **Tip:** Keep `original_file_name` and `stored_file_name` separate in the database — this lets you safely rename/download files without ever risking a file system collision.

---

## 📋 8. Document List

The document listing endpoint (`GET /document/documents/`) is expected to support:

- **Pagination** — `page` and `limit` query parameters control which page of results is returned.
- **Search** — a `search` query parameter filters documents by name.
- **Status Filter** — a `status` query parameter filters by document status (e.g. `Pending`, `Completed`).
- **Number of Signers** — each document record includes a count of assigned signer roles.
- **Uploader Name** — the name of the user who uploaded the document.
- **Page Count** — total number of pages in the PDF.
- **File Size** — human-readable size of the stored file (e.g. `1.2 MB`).

---

## 🖊️ 9. Signature Fields — Complete Workflow

```
 User uploads PDF
        │
        ▼
 Opens PDF Editor
        │
        ▼
 Loads existing signature fields  ── GET /document/documents/:id/signature-fields
        │
        ▼
 Drag signer role
        │
        ▼
 Drop on PDF
        │
        ▼
 Save signature fields            ── PUT /document/documents/:id/signature-fields
        │
        ▼
 Update signature fields          ── PUT /document/documents/:id/signature-fields
        │
        ▼
 Reopen later
        │
        ▼
 Existing fields appear again     ── GET /document/documents/:id/signature-fields
```

### Signature Field Properties

| Property         | Type    | Description                                                                            |
| ---------------- | ------- | -------------------------------------------------------------------------------------- |
| `documentId`   | number  | The document the field belongs to (from the URL path, not the body)                    |
| `signerRoleId` | number  | Which signer role (Buyer, Seller, etc.) must fill this field                           |
| `pageNumber`   | number  | Which page of the PDF the field appears on                                             |
| `xPosition`    | number  | Horizontal coordinate of the field on the page                                         |
| `yPosition`    | number  | Vertical coordinate of the field on the page                                           |
| `width`        | number  | Width of the signature box                                                             |
| `height`       | number  | Height of the signature box                                                            |
| `required`     | boolean | Whether the signer must complete this field before the document can be marked complete |

> 💡 **Tip:** Because `PUT` is used for both the initial save and later updates, saving fields is **idempotent** — sending the full field list will fully replace the document's current signature fields.

---

## 🧑‍⚖️ 10. Signer Roles — CRUD

Signer roles represent the type of participant who needs to sign a document. Example roles seen in this system:

- Buyer
- Seller
- Approver
- Manager
- Witness

Signer roles are **dynamic** and fully manageable through the API — not hardcoded — via the `signer-role/signer-roles` endpoints:

| Operation | Endpoint                                 |
| --------- | ---------------------------------------- |
| Create    | `POST /signer-role/signer-roles`       |
| List All  | `GET /signer-role/signer-roles`        |
| Get One   | `GET /signer-role/signer-roles/:id`    |
| Update    | `PUT /signer-role/signer-roles/:id`    |
| Delete    | `DELETE /signer-role/signer-roles/:id` |

This means new organizations can define their own custom signer roles beyond the examples above.

---

## ❗ 11. Error Codes

| Code          | Meaning                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| **400** | Bad Request — the request body/params/query failed validation                           |
| **401** | Unauthorized — missing, invalid, or expired authentication token/cookie                 |
| **403** | Forbidden — authenticated, but the user's role does not permit this action              |
| **404** | Not Found — the requested resource (user, document, signer role) does not exist         |
| **409** | Conflict — the request conflicts with existing data (e.g. duplicate email or role name) |
| **500** | Internal Server Error — an unexpected error occurred on the server                      |

---

## 📶 12. HTTP Status Codes

| Code                                | When it's returned                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **200 OK**                    | A`GET`, `PUT`, `DELETE`, or `POST` (non-creation) request completed successfully               |
| **201 Created**               | A new resource was successfully created (e.g. document uploaded, signer role created, user registered) |
| **204 No Content**            | The request succeeded but there is no response body to return                                          |
| **400 Bad Request**           | Validation failed on the request body, params, or query string                                         |
| **401 Unauthorized**          | The request lacks valid authentication credentials                                                     |
| **403 Forbidden**             | The authenticated user does not have permission to perform this action                                 |
| **404 Not Found**             | The requested resource does not exist                                                                  |
| **409 Conflict**              | The request conflicts with the current state of a resource (duplicate data)                            |
| **500 Internal Server Error** | An unhandled exception occurred while processing the request                                           |

---

## ✅ 13. Validation Rules

| Field                                               | Rule                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `email`                                           | Required, must be a valid email format                             |
| `password`                                        | Required, minimum length enforced                                  |
| `documentName`                                    | Required, non-empty string                                         |
| `file`                                            | Required,**PDF only**, **maximum size 5 MB**           |
| `roleName`                                        | Required, must be unique                                           |
| `pageNumber`                                      | Required, positive integer, must not exceed document's total pages |
| `signerRoleId`                                    | Required, must reference an existing signer role                   |
| `xPosition`, `yPosition`, `width`, `height` | Required, numeric                                                  |
| `status` (user update)                            | Must be a valid allowed status value                               |

---

## 🗄️ 14. Database Relationships

```
 Users
   │
   │  (one user uploads many documents)
   ▼
 Documents
   │
   │  (one document has many signature fields)
   ▼
 Signature Fields
   │
   │  (each signature field references one signer role)
   ▼
 Signer Roles
```

**In plain English:**

- A **User** can upload many **Documents**.
- Each **Document** can have many **Signature Fields** placed on it (one per page/position).
- Each **Signature Field** is linked to exactly one **Signer Role**, which determines who is responsible for signing that specific field.
- A **Signer Role** can be reused across many documents and many signature fields.

---

## 🔄 15. Authentication Flow (ASCII Diagram)

### Admin

```
 Admin Login  (POST /admin/login)
      │
      ▼
 Access Token issued
      │
      ▼
 Token stored in Cookie
      │
      ▼
 Authenticated Request  (e.g. GET /admin/profile)
      │
      ▼
 Logout  (POST /admin/logout)
```

### User

```
 User Login  (POST /user/login)
      │
      ▼
 Access Token issued
      │
      ▼
 Token stored in Cookie
      │
      ▼
 Authenticated Request  (e.g. GET /user/profile)
      │
      ▼
 Logout  (POST /user/logout)
```

---

## 🔁 16. Complete API Sequence (End-to-End Workflow)

```
 Admin Login              POST   /admin/login
      │
      ▼
 Create User              PUT    /admin/users/:id   (or a registration endpoint, if present)
      │
      ▼
 User Login               POST   /user/login
      │
      ▼
 Upload Document          POST   /document/upload
      │
      ▼
 Get Documents            GET    /document/documents/
      │
      ▼
 Open Document             GET    /document/documents/:id
      │
      ▼
 Load Signature Fields    GET    /document/documents/:id/signature-fields
      │
      ▼
 Save Signature Fields    PUT    /document/documents/:id/signature-fields
      │
      ▼
 Download Document        (not present in the attached collection — see note below)
```

> ⚠️ **Note:** A dedicated "Download Document" endpoint was **not found** in the attached Postman collection. If one exists in the actual backend, add it here; otherwise the document's stored `file_path` is presumably served via a static file route.

---

## 🗂️ 17. Folder Structure

A typical Node.js + Express + TypeScript backend of this shape follows a layered structure:

```
src/
├── controllers/     # Request handlers — parse input, call services, shape responses
├── routes/          # Express route definitions, grouped by resource
├── services/        # Business logic — talks to the database, orchestrates operations
├── middlewares/      # Auth guards, error handlers, file upload (Multer) config
├── config/           # Database connection, environment config
├── utils/             # Helper functions (token generation, file naming, etc.)
├── schemas/           # Request validation schemas
└── uploads/            # Physical storage location for uploaded PDF files
```

> 💡 **Tip:** This structure is inferred from standard practice for this stack — verify against the actual repository structure if precision is required.

---

## 📦 18. Response Format

All API responses follow a consistent envelope shape.

**✅ Success:**

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {}
}
```

**❌ Error:**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

---

## 📮 19. Postman Usage

1. **Import Collection** — Open Postman → *Import* → select `esign.postman_collection.json`.
2. **Set the `base_url` variable** — Create/select an environment and set `base_url` to `http://localhost:8000`.
   > ⚠️ Also set `baseURL` (same value) since the `Admin Profile` request uses that variable name specifically.
   >
3. **Login first** — Run `Admin login` or `User login` before calling any protected endpoint. Postman automatically stores the returned cookies.
4. **Cookies** — Make sure Postman's cookie jar is enabled for `localhost` so the `accessToken`/`refreshToken` cookies persist across requests in the same session.
5. **Authenticated APIs** — Once logged in, all subsequent requests within the same Postman session will automatically include the auth cookies — no manual header configuration needed.

---

## 🧾 Appendix — Quick Reference Table

| Method | Endpoint                                     | Auth | Role |
| ------ | -------------------------------------------- | :--: | :---: |
| POST   | `/admin/login`                             |  ❌  |  —  |
| POST   | `/admin/logout`                            |  ✅  | Admin |
| GET    | `/admin/profile`                           |  ✅  | Admin |
| PUT    | `/admin/users/:id`                         |  ✅  | Admin |
| DELETE | `/admin/users/:id`                         |  ✅  | Admin |
| POST   | `/user/login`                              |  ❌  |  —  |
| POST   | `/user/logout`                             |  ✅  | User |
| GET    | `/user/profile`                            |  ✅  | User |
| POST   | `/document/upload`                         |  ✅  | User |
| GET    | `/document/documents/`                     |  ✅  | User |
| GET    | `/document/documents/:id`                  |  ✅  | User |
| PUT    | `/document/documents/:id`                  |  ✅  | User |
| DELETE | `/document/document/:id`                   |  ✅  | User |
| GET    | `/document/documents/:id/signature-fields` |  ✅  | User |
| PUT    | `/document/documents/:id/signature-fields` |  ✅  | User |
| POST   | `/signer-role/signer-roles`                |  ✅  | User |
| GET    | `/signer-role/signer-roles`                |  ✅  | User |
| GET    | `/signer-role/signer-roles/:id`            |  ✅  | User |
| PUT    | `/signer-role/signer-roles/:id`            |  ✅  | User |
| DELETE | `/signer-role/signer-roles/:id`            |  ✅  | User |
