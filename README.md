# 🍽️ Smart Restaurant – Table Management System

A secure table management and QR code generation system for restaurants.  
Built with Client–Server architecture using Node.js (Backend) and React (Frontend).

---

## 🚀 Features

### Table Management (CRUD)
- Create new tables
  - Prevent duplicate table numbers
  - Capacity validation (1–20)
- View table list with status (active / inactive)
- Automatic sorting by table number

### QR Code & Security
- Secure QR code generation using JWT (Signed Token)
- Prevents URL forgery and manual manipulation
- QR regeneration mechanism
  - When a new QR is generated, old tokens are invalidated automatically
- QR utilities
  - Preview
  - Download as PNG
  - Print as PDF

---

## 🛠️ Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Token)
- Libraries
  - pg
  - qrcode
  - cors
  - dotenv

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- file-saver

---

## ⚙️ Installation & Setup

### Database Setup (PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT CHECK (capacity > 0 AND capacity <= 20),
    location VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    qr_token TEXT,
    qr_token_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Backend Setup

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

---

### Frontend Setup

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

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | `/api/tables` | Get all tables (filter by status/location) |
| POST | `/api/tables` | Create a new table |
| GET | `/api/tables/:id` | Get table details |
| PUT | `/api/tables/:id` | Update table information |
| POST | `/api/tables/:id/qr` | Generate or regenerate secure QR code |

---

## 📂 Project Structure

```text
table-management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── fonts/
│   ├── middlewares/
│   ├── routes/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.tsx
    ├── tailwind.config.js
    └── package.json
```

---

## 📝 Notes

QR code URL format:

```
http://frontend-url/menu?table=UUID&token=JWT_TOKEN
```

- JWT token is stored in database field `qr_token`
- When QR code is regenerated, old tokens are automatically invalidated
- Ensures secure table identification and prevents QR reuse attacks

---

## ✅ Summary

- Secure table management system
- JWT-protected QR codes
- Automatic QR invalidation
- Clean Client–Server architecture
- Ready for integration with ordering systems
