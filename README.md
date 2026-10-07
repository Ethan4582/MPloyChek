# MPloyChek

![MPloyChek Hero](./frontend/public/hero.png)

A lightweight RBAC employment verification platform built with Angular 18, Node.js, and MongoDB (with zero-config in-memory fallback).

---

## Architecture & features

📄 **[System Design Specification](./system-design.md)**

- **Frontend**: Angular 18 standalone SPA with Signals state management & functional HTTP interceptors.
- **Backend**: TypeScript REST API (Express) with layered architecture and Zod request validation.
- **Database**: MongoDB/Mongoose with auto-fallback to embedded in-memory database and auto-seeded records.
- **RBAC**: Admin tier (full org records, risk scores, user management) vs. Employee tier (self-records only).
- **Directory & Filters**: Multi-attribute filtering (department, clearance, verification status) with search.
- **Deployment**: Zero-config local boot and multi-container Docker Compose support.

---

## Test accounts

The login screen includes one-click buttons to populate these accounts:

| Role | User ID / Email | Password | Access scope |
| :--- | :--- | :--- | :--- |
| Administrator | `admin@mploychek.com` | `Password@123` | Full organization records, audit notes, compensation grades, and user management. |
| General User | `user@mploychek.com` | `Password@123` | User-scoped records only. Sensitive compensation and risk fields are excluded. |

---

## Getting started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Docker (optional)

---

### Option 1: Quick start (no MongoDB or Docker required)

From the project root:

```bash
# 1. Install dependencies for root, backend, and frontend
npm run install:all

# 2. Start backend and frontend together
npm run dev
```

The frontend runs at `http://localhost:4200` and the API runs at `http://localhost:3000`.

---

### Option 2: Docker Compose

If you have Docker installed, start the entire stack including a dedicated MongoDB container:

```bash
docker compose up --build
```

- Web application: `http://localhost:4200`
- Backend API: `http://localhost:3000`
- MongoDB: `localhost:27017`

---

### Option 3: Manual startup

#### Backend

```bash
cd backend
npm install
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

---

## Environment variables

To connect an external MongoDB instance, create a `.env` file in the `backend/` directory:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=mploychek-production-grade-jwt-secret-key-2026
JWT_EXPIRES_IN=8h

# Optional. If omitted, MPloyChek runs an embedded in-memory MongoDB database.
MONGO_URI=mongodb://localhost:27017/mploychek
```

To re-seed an external database at any time, run:

```bash
cd backend
npm run seed
```

---

## License

Distributed under the [MIT License](LICENSE). See `LICENSE` for more information.

---

## Author

**Ashirwad Singh**

- Portfolio: [https://www.aash7.xyz/](https://www.aash7.xyz/)
- LinkedIn: [https://www.linkedin.com/in/ashirwad08singh/](https://www.linkedin.com/in/ashirwad08singh/)
- X (Twitter): [https://x.com/ashirwadsingh_](https://x.com/ashirwadsingh_)
- Email: [singhashirwad2003@gmail.com](mailto:singhashirwad2003@gmail.com)
