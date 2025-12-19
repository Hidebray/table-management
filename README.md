# 🍽️ Smart Restaurant - Table Management System

A modern Fullstack Table Management System focusing on QR Code security and Administrator experience (Admin Dashboard). The project uses a **Client-Server** architecture with **RESTful API**.

![Project Status](https://img.shields.io/badge/Status-Completed-success) ![Security](https://img.shields.io/badge/Security-JWT%20Signed-blue) ![Stack](https://img.shields.io/badge/Stack-PERN-orange)

---

## ✨ Key Features

### 🛡️ Backend (Node.js + PostgreSQL)
- **Table Management (CRUD):** Add, Edit, Delete (Soft Delete), Filter by Location/Status.
- **QR Code Security:**
  - QR Codes contain **Signed JWT Tokens** (preventing ID guessing/enumeration attacks).
  - **Regenerate All:** Invalidate all old tokens and issue new ones instantly with a single click (prevents leaks).
- **Data Export:** Support downloading all QR Codes as a **.ZIP** archive or printing via **.PDF**.

### 🎨 Frontend (React + Tailwind CSS)
- **Admin Dashboard:** Professional interface with search, sorting, and pagination.
- **Clean Architecture:** Separation of concerns between API logic (`api/service`) and UI (`pages/components`).
- **Interactive UI:** QR Code preview modal, intuitive form validation.

---

## 🛠️ Installation & Setup

### 1. Database Setup (PostgreSQL)
Run the following SQL script to create the necessary table and extensions:

```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 20),
    location VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    qr_token VARCHAR(500),
    qr_token_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_number)
);

CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_location ON tables(location);
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_restaurant
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

Run backend server:

```bash
npm run dev
```

Backend URL:

```
http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

## 📡API Documentation
Base URL: http://localhost:5000/api

## 1. Table Administration

**Prefix:** `/admin/tables`

| Method | Endpoint        | Description |
|------|----------------|-------------|
| GET  | `/`            | Get list of tables <br> **Query:** `?status=active&location=Indoor` |
| POST | `/`            | Create a new table <br> **Body:** `{ table_number, capacity, location }` |
| PUT  | `/:id`         | Update table details |
| PATCH| `/:id/status`  | Change table status (Soft Delete) |
| GET  | `/locations`   | Get list of available locations |

## 2. QR Code & Security

**Prefix:** `/admin/tables`

| Method | Endpoint | Description |
|------|---------|-------------|
| POST | `/:id/qr/generate` | Generate a new QR code for a specific table (Updates DB token) |
| POST | `/qr/regenerate-all` | Reset all QR codes (Generate new tokens for all tables) |
| GET  | `/qr/download-all` | Download all QR images as a **.ZIP** file |
| GET  | `/qr/download-pdf` | Download QR codes as a **.PDF** file for printing |

## 3. Customer (Public Routes)

| Method | Endpoint | Description |
|------|---------|-------------|
| GET  | `/menu` | Verify QR token and display menu |

---

## 📂 Project Structure

```text
table-management/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Business logic (CRUD, QR Generation)
│   ├── routes/             # API Routing
│   ├── middlewares/        # Input Validation
│   └── server.js           # Server Entry Point
│
└── frontend/
    ├── src/
    │   ├── api/            # API Services (axiosClient, tableApi)
    │   ├── components/     # UI Components (TableList, Modal, Icons)
    │   ├── pages/          # Main Pages (TableManager, Menu)
    │   └── main.jsx        # Frontend Entry Point
    └── tailwind.config.js  # UI Configuration
```

---

## 🚀 Tech Stack
- Backend: Node.js, Express, PostgreSQL, qrcode (lib), jsonwebtoken (JWT).
- Frontend: React (Vite), Axios, Tailwind CSS, file-saver.

---

## 📝 Notes

QR code URL format:

```
http://frontend-url/menu?table=UUID&token=JWT_TOKEN
```

- JWT token is stored in database field `qr_token`
- When QR code is regenerated, old tokens are automatically invalidated
- Ensures secure table identification and prevents QR reuse attacks
