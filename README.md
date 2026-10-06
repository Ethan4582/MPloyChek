# MPloyChek — Employment Verification & RBAC Portal

> **Production-Grade Angular 18 & Node.js/TypeScript Architecture with Dual-Mode MongoDB / Cloud Extensibility**

---

## 🌟 Executive Summary

**MPloyChek** is an enterprise-grade Single Page Application (SPA) built to demonstrate modern architectural patterns across the Angular frontend and Node.js/TypeScript backend:
- **Angular 18 Frontend**: Built using modern Standalone Components, Angular Signals (`signal`, `computed`), RxJS streams, functional HTTP interceptors, route guards, and custom glassmorphism UI with Tailwind CSS.
- **Node.js / Express / TypeScript Backend**: Layered architecture featuring Controller-Service-Repository pattern, Mongoose schemas with compound indexes, dual-mode database connection (local MongoDB with automatic embedded in-memory fallback), and Zod validation.
- **Configurable Asynchronous Latency Engine**: Parameterized delay middleware (`?delay=<ms>`) with live frontend stopwatch, animated skeleton loaders, and interactive telemetry panel showcasing real-time async processing on load and on demand.
- **Role-Based Access Control (RBAC)**: Strict role demarcation between `Admin` and `General User` at both the database query layer and UI presentation layer.

---

## 🔑 Pre-Seeded Test Credentials

| Role | User ID / Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@mploychek.com` | `Admin@123` | **Full Organization**: View all 10 employee records, confidential compensation grades, risk scores, audit notes, and access the Database User Management console. |
| **General User** | `user@mploychek.com` | `User@123` | **User-Scoped Only**: Restricted to viewing own records (3 records). Confidential columns (Salary Grade, Risk Score, Audit Notes) are completely omitted by the backend repository. Protected from accessing `/admin/users`. |

> **Evaluator Tip**: The login page provides **1-Click Test Preset** buttons to instantly fill credentials for either role.

---

## 🎯 Evaluation Criteria Fulfillment Matrix

| Criterion | Implementation in MPloyChek | File Reference |
| :--- | :--- | :--- |
| **Effective Use of Angular Framework & Libraries** | • Angular 18 Standalone Architecture (no NgModules)<br>• Fine-grained reactivity with **Angular Signals** (`signal`, `computed`)<br>• Declarative **RxJS** pipelines with error handling<br>• Functional HTTP Interceptors: `authInterceptor`, `delayInterceptor`, `telemetryInterceptor`, `errorInterceptor`<br>• `APP_INITIALIZER` to asynchronously restore JWT session before route activation (zero-flicker)<br>• Functional Route Guards (`authGuard`, `adminGuard`, `publicGuard`) | [app.config.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/app/app.config.ts)<br>[auth.service.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/app/core/services/auth.service.ts)<br>[dashboard.component.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/app/features/dashboard/dashboard.component.ts) |
| **Knowledge of API & Cloud Framework** | • Clean Controller-Service-Repository pattern<br>• Pluggable Repository interface (`IUserRepository`, `IRecordRepository`) with AWS DynamoDB seam (`DynamoUserRepositoryRef`) and Mongo implementation<br>• Dual-mode Mongoose connection with embedded fallback<br>• Strict boundary schema validation with **Zod**<br>• JWT Bearer Token authentication & RBAC middleware | [user.repository.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/backend/src/repositories/user.repository.ts)<br>[auth.middleware.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/backend/src/middleware/auth.middleware.ts)<br>[connection.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/backend/src/db/connection.ts) |
| **UI Aspects & Creative Design** | • Custom Dark Glassmorphism design system (`slate-950` backdrop, glass cards, ambient glow gradients)<br>• Shimmering skeleton loaders during async delays<br>• Live telemetry drawer tracking in-flight and completed HTTP calls<br>• Real-time millisecond countdown stopwatch showcasing async states<br>• Responsive data tables with multi-filter search and inspection modals | [styles.css](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/styles.css)<br>[telemetry-drawer.component.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/shared/components/telemetry-drawer/telemetry-drawer.component.ts) |
| **Delay Mechanism & Async Showcase** | • Backend delay middleware extracts `?delay=<ms>` query param or `X-Simulated-Delay` header<br>• Interceptor automatically injects user-selected delay from `DelayService`<br>• Interactive delay presets (0ms, 500ms, 1500ms, 3000ms, 5000ms)<br>• Injects `X-Simulated-Delay` and `X-Response-Duration` headers into response | [delay.middleware.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/backend/src/middleware/delay.middleware.ts)<br>[delay.interceptor.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/app/core/interceptors/delay.interceptor.ts) |
| **Admin User Management** | • Dedicated Admin console at `/admin/users`<br>• Full CRUD: List all registered DB users, Add new user with validation, 1-click toggle role (Admin / General User), toggle status (Active / Disabled), and delete user | [admin-users.component.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/frontend/src/app/features/admin/admin-users.component.ts)<br>[user.controller.ts](file:///C:/Users/singh/Desktop/Dev/Web-2/assignments/MPloyChek/backend/src/controllers/user.controller.ts) |

---

## 🏗️ Architecture & Seams

```
MPloyChek/
├── backend/                        # Node.js / Express / TypeScript REST API
│   ├── src/
│   │   ├── config/env.ts           # Centralized configuration & environment variables
│   │   ├── types/index.ts          # TypeScript interfaces & Zod validation schemas
│   │   ├── db/
│   │   │   ├── connection.ts       # Dual-mode connection (Local Mongo / In-Memory fallback)
│   │   │   ├── schemas/            # Mongoose schemas with compound indexes
│   │   │   └── seed.ts             # Auto-seeding for test accounts & employee records
│   │   ├── repositories/           # Repository Pattern (IUserRepository, DynamoDB seam)
│   │   ├── services/               # Domain logic (AuthService, UserService, RecordService)
│   │   ├── middleware/             # delay.middleware, auth.middleware, validate, error
│   │   ├── controllers/            # Express controllers
│   │   ├── routes/                 # /api/auth, /api/users, /api/records, /api/health
│   │   └── server.ts               # Server bootstrap & CORS setup
│   └── package.json
│
└── frontend/                       # Angular 18 Standalone SPA
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── models/         # auth.models, record.models, telemetry.models
    │   │   │   ├── services/       # AuthService, RecordService, UserService, DelayService, TelemetryService, ToastService
    │   │   │   ├── interceptors/   # delayInterceptor, authInterceptor, telemetryInterceptor, errorInterceptor
    │   │   │   └── guards/         # authGuard, adminGuard, publicGuard
    │   │   ├── shared/components/  # NavbarComponent, TelemetryDrawerComponent, ToastComponent
    │   │   ├── features/
    │   │   │   ├── auth/           # LoginComponent (Preset fills, Role selector)
    │   │   │   ├── dashboard/      # DashboardComponent (User info, records table, delay slider)
    │   │   │   └── admin/          # AdminUsersComponent (DB user administration)
    │   │   ├── app.config.ts       # Standalone config with APP_INITIALIZER & HTTP Interceptors
    │   │   ├── app.routes.ts       # Lazy routes & guards
    │   │   └── app.component.ts    # Shell host
    │   ├── styles.css              # Custom Tailwind CSS glassmorphic tokens
    │   └── index.html
    └── package.json
```

---

## 🚀 Running the Project Locally

### 1. Start the Backend API (Port 3000)
```powershell
cd MPloyChek/backend
npm install
npm run build
npm start
```
*Health Check*: `http://localhost:3000/api/health`

### 2. Start the Angular 18 Frontend (Port 4200)
```powershell
cd MPloyChek/frontend
npm install
npm start
```
*Open in Browser*: `http://localhost:4200`
