# MPloyChek

> **Quick Navigation:** &nbsp; [📋 System Design Specification](./system-design.md) &nbsp;•&nbsp; [⚖️ MIT License](./LICENSE) &nbsp;•&nbsp; [👨‍💻 Creator Portfolio](https://www.aash7.xyz/)

[![System Design](https://img.shields.io/badge/Architecture-System%20Design%20Spec-bc8c74?style=flat-square&logo=gitbook&logoColor=white)](./system-design.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Angular 19](https://img.shields.io/badge/Angular-19.0-dd0031?style=flat-square&logo=angular)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-In--Memory%20Embedded%20MongoDB-47a248?style=flat-square&logo=mongodb)](./system-design.md)

![MPloyChek Hero](./frontend/public/hero.png)

A lightweight role-based employment verification platform built with Angular 19, Express/Node.js, and dual-mode persistence (in-memory embedded database with external MongoDB support).

---

## Architecture & features

📄 **[Full System Design Specification](./system-design.md)**

- **Frontend**: Angular 19 standalone SPA with Signals state management & functional HTTP interceptors.
- **Backend**: TypeScript REST API (Express) with layered architecture and Zod request validation.
- **Database**: MongoDB/Mongoose with zero-configuration auto-fallback to embedded in-memory database and auto-seeded records.
- **RBAC**: Admin tier (full organization records, risk scores, user management) vs. Employee tier (self-records only).
- **Security**: Field-level query projections at the database layer (confidential fields are never transmitted over the wire to standard users).
- **Telemetry & Latency Simulation**: Parameterized `?delay=<ms>` query support executing non-blocking timers on the server event loop.
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

```bash
docker compose up --build
```

---

## Documentation

- **[System Design Specification](./system-design.md)**: Architectural patterns, repository abstraction, query projection RBAC, capacity estimation, and failure modes.
- **[MIT License](./LICENSE)**: Open source licensing terms.
