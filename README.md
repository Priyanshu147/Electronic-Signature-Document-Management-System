# 📄 Electronic Signature Document Management System

A full-stack, enterprise-grade **Electronic Signature & Document Management System** built with **React 18**, **TypeScript**, **Material-UI (MUI v5)**, **Node.js**, **Express 5**, and **MySQL**.

The platform empowers organizations to securely upload PDF documents, define custom signer roles (e.g. Buyer, Seller, Approver, Witness), visually drag-and-drop signature field placements onto PDF pages, automatically compile signed PDFs with embedded signature boxes using `pdf-lib`, and manage users via an administrative portal.

---

## 📐 System Architecture & Overview

### Architectural Pattern

The application follows a **Decoupled Client-Server Architecture**:

- **Frontend SPA**: Vite + React 18 single-page application using TanStack React Query v5 for asynchronous state synchronization and optimistic UI updates.
- **Backend REST API**: Express 5 service structured in a 3-tier Layered Architecture (**Controllers -> Services -> Database Access / Utilities**).
- **Database Layer**: Relational MySQL 8.x database utilizing connection pooling (`mysql2`) and transaction-safe operations.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (React 18)                               │
│  ┌────────────────────┐   ┌──────────────────────────┐   ┌────────────────────┐  │
│  │   Pages & Router   │───│  TanStack React Query    │───│   Axios Instance   │  │
│  │ (Dashboard/Editor) │   │ (Zero-stale cache sync)  │   │  (JWT Interceptor) │  │
│  └────────────────────┘   └──────────────────────────┘   └────────────────────┘  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTP REST (JSON / Multipart)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND (Express 5)                               │
│  ┌────────────────────┐   ┌──────────────────────────┐   ┌────────────────────┐  │
│  │ Express Router     │───│ Controller Layer         │───│ Middleware Layer   │  │
│  │ (Auth/Doc/Admin)   │   │ (Request/Response)       │   │ (JWT & Zod Guard)  │  │
│  └────────────────────┘   └────────────┬─────────────┘   └────────────────────┘  │
│                                        │                                         │
│                                        ▼                                         │
│                           ┌──────────────────────────┐                           │
│                           │ Service Layer            │                           │
│                           │ (Business Logic & PDF)   │                           │
│                           └────────────┬─────────────┘                           │
└────────────────────────────────────────┼─────────────────────────────────────────┘
                                         │ SQL Queries / Connection Pool
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 DATABASE & STORAGE                               │
│  ┌─────────────────────────────────────────┐   ┌──────────────────────────────┐  │
│  │ MySQL 8.x (Users, Documents, Signers)   │   │ Local Uploads Directory      │  │
│  └─────────────────────────────────────────┘   └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack & Dependencies

### Frontend Technologies

| Layer                           | Tech Stack                     | Description                                                        |
| :------------------------------ | :----------------------------- | :----------------------------------------------------------------- |
| **Framework**             | React 18 + TypeScript          | Component-driven UI architecture                                   |
| **Build Tool**            | Vite                           | Lightning-fast module bundling & HMR                               |
| **UI Component Library**  | Material-UI (MUI v5)           | Enterprise-grade styled components                                 |
| **Data Fetching & Cache** | TanStack React Query v5        | Server state management & cache invalidation                       |
| **Form Handling**         | React Hook Form                | Performant form state management                                   |
| **Schema Validation**     | Zod +`@hookform/resolvers`   | Strict client-side data validation                                 |
| **PDF Rendering**         | `react-pdf` / `pdfjs-dist` | Canvas-based multi-page PDF rendering                              |
| **HTTP Client**           | Axios                          | Request interceptors, Bearer token attachment, credentials support |
| **Notifications**         | `react-hot-toast`            | Toast notification alerts                                          |

### Backend Technologies

| Layer                         | Tech Stack                                         | Description                                            |
| :---------------------------- | :------------------------------------------------- | :----------------------------------------------------- |
| **Runtime & Framework** | Node.js + Express 5 + TypeScript                   | Non-blocking I/O web server                            |
| **Execution Engine**    | `tsx`                                            | TypeScript execution and live watching                 |
| **Database Driver**     | `mysql2`                                         | Promise-based MySQL connection pool driver             |
| **Security & Auth**     | `jsonwebtoken`, `bcrypt`, `helmet`, `cors` | Token verification, password hashing, security headers |
| **File Processing**     | `multer`                                         | Disk-storage handling for PDF uploads                  |
| **PDF Manipulation**    | `pdf-lib`                                        | Server-side PDF modification & signature box stamping  |
| **Validation**          | Zod                                                | Strict runtime request body and query validation       |

---

## 📁 Folder Structure

```text
Electronic-Signature-Document-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── multerConfig.ts
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── signerRole.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── errors/
│   │   │   └── APIError.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authenticate.ts
│   │   │   ├── catchAsync.ts
│   │   │   ├── catchError.ts
│   │   │   ├── general.ts
│   │   │   └── validateSchema.ts
│   │   ├── routes/
│   │   │   ├── admin.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── signerRole.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── schemas/
│   │   │   ├── admin.schema.ts
│   │   │   ├── document.schema.ts
│   │   │   ├── signerRole.schema.ts
│   │   │   └── user.schema.ts
│   │   ├── services/
│   │   │   ├── admin.service.ts
│   │   │   ├── document.service.ts
│   │   │   ├── signerRole.service.ts
│   │   │   └── user.service.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   └── helper.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── admin.api.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── axios.ts
│   │   │   ├── document.api.ts
│   │   │   ├── signerRole.api.ts
│   │   │   └── user.api.ts
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   └── PageHeader.tsx
│   │   │   ├── forms/
│   │   │   │   ├── EditDocumentNameDialog.tsx
│   │   │   │   └── ResetPasswordDialog.tsx
│   │   │   ├── pdf/
│   │   │   │   └── PdfPageCanvas.tsx
│   │   │   └── signer/
│   │   │       ├── SignatureFieldBox.tsx
│   │   │       └── SignerRoleSidebar.tsx
│   │   ├── constants/
│   │   │   ├── apiEndpoints.ts
│   │   │   └── appConstants.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useDebounce.ts
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx
│   │   │   └── UserLayout.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── UserForm.tsx
│   │   │   │   └── Users.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AdminLogin.tsx
│   │   │   │   └── UserLogin.tsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentEditor.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   └── UploadDocument.tsx
│   │   │   ├── signerRoles/
│   │   │   │   ├── SignerRoleForm.tsx
│   │   │   │   └── SignerRoleList.tsx
│   │   │   └── user/
│   │   │       └── Dashboard.tsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── theme/
│   │   │   └── theme.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── document.types.ts
│   │   │   ├── signerRole.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/
│   │   │   └── formatters.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── API.md
├── DATABASE_SCHEMA.md
├── eSign_API_Specification.docx
├── eSign_Database_Documentation.docx
└── README.md
```

---

## ✨ Core Functional Features

### 1. Document Management & Server-Side Sorting

- **PDF Upload**: Upload PDF files up to 5MB with automatic filename sanitization and page count calculation.
- **Filter & Search**: Full-text search by document title or owner name, with status filtering (`Draft`, `In Progress`, `Completed`, `Archived`).
- **Dynamic Sorting**: Server-side sorting on table column headers (`Document Name`, `Uploaded By`, `Status`, `Uploaded Date`, `File Size`, `Signers Count`) with `ASC`/`DESC` toggling.
- **Download Options**: Download original unburned PDF (`?raw=true`) or fully compiled PDF with stamped signature fields.

### 2. Drag-and-Drop Visual PDF Signature Editor

- Interactive multi-page PDF viewer powered by HTML5 canvas.
- Drag-and-drop placement of signature boxes anywhere on any page.
- Assign signature boxes to custom signer roles with visual color-coded badges.
- Reposition, resize, configure required status, and save placement coordinates to backend in real time.

### 3. Signer Roles Management

- Custom role creation (e.g. `Client / Buyer`, `Seller / Vendor`, `Legal Approver`, `Witness`).
- Color badge assignment for visual separation in document editor.
- Complete CRUD operations with client-side & server-side sorting.

### 4. Administrative User Management Portal

- Separate administrative authentication flow (`/admin/login`).
- Admin Dashboard displaying active users, total users, inactive users, and total documents.
- User management table with pagination, full-text search, status filtering, column sorting, user creation, profile edits, password resets, and account deactivation.

---

## 🗄 Database Schema

The database structure and table relationships are documented in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

---

## 🔒 Security & Authentication Architecture

1. **JWT Authentication & Passwords**:
   - User & Admin passwords hashed using `bcrypt` (salt rounds: `10`).
   - Short-lived JWT Access Tokens issued upon authentication.
   - Authentication tokens passed in `Authorization: Bearer <TOKEN>` header or HTTP-only cookies.
2. **Role Guards (Middleware)**:
   - `authenticate`: Validates JWT signature and attaches decoded user to `req.user`.
   - `userOnly`: Ensures authenticated subject has `user` role privileges.
   - `adminOnly`: Ensures authenticated subject has `admin` role privileges.
3. **Input Sanitization & Protection**:
   - `helmet` middleware sets secure HTTP headers (X-SS-Protection, HSTS, frameguard).
   - SQL Injection protection via parameterized queries (`db.query('SELECT ... WHERE id = ?', [id])`).
   - Strict Zod validation schemas for request bodies.

---

## 🚀 Environment Setup & Installation Guide

### Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MySQL Database**: `v8.0` or higher

---

### Step 1: Environment Variables Setup

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=electronic_signature_db

# JWT Secrets
JWT_SECRET=super_secret_jwt_access_key_2026
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_2026
```

---

### Step 2: Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install backend dependencies
npm install

# 3. Start development server with live reload
npm run dev
```

Backend HTTP server will start listening at **`http://localhost:8000`**.

---

### Step 3: Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start Vite development server
npm run dev
```

Frontend Web application will run at **`http://localhost:5173`**.

---

## 📚 API Reference Documentation

For detailed information on all available REST API endpoints, request bodies, query parameters, validation rules, and sample JSON responses, refer to:

👉 **[API.md](./API.md)**

---

## 📜 License

This project is proprietary and released under the **MIT License**.
