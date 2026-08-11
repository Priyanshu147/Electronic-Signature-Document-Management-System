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
| Layer | Tech Stack | Description |
| :--- | :--- | :--- |
| **Framework** | React 18 + TypeScript | Component-driven UI architecture |
| **Build Tool** | Vite | Lightning-fast module bundling & HMR |
| **UI Component Library** | Material-UI (MUI v5) | Enterprise-grade styled components |
| **Data Fetching & Cache** | TanStack React Query v5 | Server state management & cache invalidation |
| **Form Handling** | React Hook Form | Performant form state management |
| **Schema Validation** | Zod + `@hookform/resolvers` | Strict client-side data validation |
| **PDF Rendering** | `react-pdf` / `pdfjs-dist` | Canvas-based multi-page PDF rendering |
| **HTTP Client** | Axios | Request interceptors, Bearer token attachment, credentials support |
| **Notifications** | `react-hot-toast` | Toast notification alerts |

### Backend Technologies
| Layer | Tech Stack | Description |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js + Express 5 + TypeScript | Non-blocking I/O web server |
| **Execution Engine** | `tsx` | TypeScript execution and live watching |
| **Database Driver** | `mysql2` | Promise-based MySQL connection pool driver |
| **Security & Auth** | `jsonwebtoken`, `bcrypt`, `helmet`, `cors` | Token verification, password hashing, security headers |
| **File Processing** | `multer` | Disk-storage handling for PDF uploads |
| **PDF Manipulation** | `pdf-lib` | Server-side PDF modification & signature box stamping |
| **Validation** | Zod | Strict runtime request body and query validation |

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

## 🗄 Database Architecture & Schema

The application uses MySQL relational database with foreign key constraints.

### 1. `users` Table
Stores registered platform users and administrative accounts.
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  last_login DATETIME NULL,
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `documents` Table
Stores uploaded PDF document metadata.
```sql
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploaded_by INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  page_count INT DEFAULT 1,
  status ENUM('Draft', 'In Progress', 'Completed', 'Archived') DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. `signer_roles` Table
Defines reusable signing roles across documents.
```sql
CREATE TABLE signer_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. `document_signature_fields` Table
Stores coordinates and properties of placed signature boxes on PDF pages.
```sql
CREATE TABLE document_signature_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL,
  signer_role_id INT NOT NULL,
  page_number INT NOT NULL DEFAULT 1,
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  width FLOAT NOT NULL DEFAULT 150.0,
  height FLOAT NOT NULL DEFAULT 50.0,
  required TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (signer_role_id) REFERENCES signer_roles(id) ON DELETE CASCADE
);
```

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
