# MPloyChek: System design

> Role-based employment verification platform that isolates sensitive records through database-level query projections, abstract repository seams, and non-blocking asynchronous latency simulation.

---

## Problem statement

Organizations handling employee verification must give administrators and standard employees access to the same portal while enforcing strict boundaries around data visibility. Standard employees require access only to their own verification status. Sensitive attributes such as compensation grades, risk scores, and internal audit notes must never reach non-administrative users.

When access control relies on frontend filtering, the backend transmits full records over the network and leaves confidential data exposed in browser inspection tools. The system must enforce authorization and data redaction at the database layer before payloads serialize. The application must also run immediately without requiring reviewers to configure database instances or cloud credentials, while remaining modular enough to swap storage backends and demonstrate client-side asynchronous processing under variable network delays.

---

## Goals and non-goals

### Goals
- Enforce server-side role-based access control with database query projections that omit confidential fields before serialization.
- Isolate data access behind repository interfaces to support MongoDB, AWS DynamoDB, or flat storage without modifying controllers.
- Provide zero-configuration local execution through an automated fallback to an embedded in-memory database with pre-seeded records.
- Implement parameterized network delays via query parameters to evaluate client-side asynchronous state handling without blocking the server event loop.
- Manage client state reactively using Angular Signals without third-party store boilerplate.

### Non-goals
- Third-party identity provider integration such as OAuth2, SAML, or OpenID Connect.
- Document binary attachment storage or PDF export pipelines.
- Distributed session clustering across multiple physical server instances.

---

## Functional requirements

- Users authenticate using user ID, password, and a claimed role. The server rejects mismatched roles with HTTP 403.
- The server issues a signed JSON Web Token on successful authentication and validates it on protected routes.
- Standard users can view only their own records, with confidential fields excluded from the response payload.
- Administrators can view all records across the organization with complete field visibility.
- Administrators can create, view, update, and delete platform user accounts.
- Any API endpoint must accept a `?delay=<ms>` query parameter that pauses execution on the server asynchronously before returning.
- The frontend displays loading states, active user context, and role-appropriate table columns.

---

## Non-functional requirements

- **Security**: Sensitive fields must be excluded at the query projection layer. They must never leave the database server in payloads intended for standard users.
- **Portability**: The application must boot with zero external database dependencies in under 3 seconds using embedded memory fallback.
- **Latency**: Baseline API response time must remain under 50 milliseconds when the delay parameter is zero. Simulated delays must execute within 5% of the requested duration.
- **Modularity**: Complete separation between HTTP transport, business logic, and database persistence layers.

---

## Scale and capacity estimation

Target deployment: Internal enterprise screening portal for an organization of 5,000 employees.

| Parameter | Value |
|---|---|
| Total employees | 5,000 |
| Active monthly users | 1,200 |
| Daily verification queries | ~3,500 requests/day |
| Read to write ratio | 20:1 |
| Average record payload (Admin) | 1.2 KB |
| Average record payload (General User) | 0.5 KB |
| Storage growth per year | ~15 MB/year |

**Traffic working:**
3,500 requests / 86,400 seconds = 0.04 queries per second baseline.
Peak traffic factor of 10x during morning onboarding windows = 0.4 queries per second sustained, with burst capacity up to 5 queries per second.
A single Node.js runtime and single-node or embedded database handles this throughput comfortably at less than 2% CPU utilization and under 120 MB memory footprint.

---

## High-level design

The architecture separates the frontend single-page application from the backend through an API gateway proxy, routing requests through authentication, authorization, business services, and a swappable repository layer.

```
Client (Angular 18)
      │
      ▼  HTTP /api (Vite reverse proxy)
API Gateway / Express Server
      │
      ▼
Delay Middleware (non-blocking timer)
      │
      ▼
JWT & RBAC Middleware (token validation & role check)
      │
      ▼
Service Layer (business logic & validation)
      │
      ▼
Repository Interface (storage abstraction)
      ├── Embedded In-Memory MongoDB (default zero-config fallback)
      ├── Local / Remote MongoDB Daemon (configured via MONGO_URI)
      └── AWS DynamoDB Client (interface-compatible implementation)
```

### Component responsibilities

1. **Frontend single-page application**: Built with Angular 18 standalone components. Uses Angular Signals for fine-grained reactivity, functional HTTP interceptors for token attachment, and route guards for client-side navigation restrictions.
2. **Reverse proxy**: Local Vite development proxy maps `/api/*` requests from port 4200 to backend port 3000, avoiding cross-origin resource sharing complexities during development.
3. **Delay engine**: Middleware intercepts the `?delay` query parameter and delays request resolution through an asynchronous Promise timer before reaching route handlers.
4. **Authentication and RBAC middleware**: Validates JWT signatures, checks expiration, and rejects access to administrative endpoints if the caller token lacks administrator privileges.
5. **Service layer**: Coordinates business operations, validates inputs, and delegates queries to repository interfaces.
6. **Repository layer**: Implements domain interfaces (`IUserRepository`, `IRecordRepository`) to decouple storage engines from application logic.

---

## Low-level design

### Parameterized delay engine

To simulate network conditions and showcase frontend asynchronous handling without freezing the Node.js event loop, the delay middleware uses non-blocking asynchronous timers:

```
function delayMiddleware(req, res, next):
    rawDelay = parseInteger(req.query.delay)
    delayMs = clamp(rawDelay, min: 0, max: 10000)

    if delayMs > 0:
        await sleep(delayMs)
    
    next()
```

Using `setTimeout` inside a Promise keeps the Node.js event loop free to process incoming connections while individual requests wait out their simulated latency.

### Database-level field projection

Restricting sensitive records at the database driver prevents information leakage. The repository inspects the authenticated user role and executes specific projections:

```
function findRecordsForUser(userId, role):
    if role == "Admin":
        return db.records.find().sort({ createdAt: -1 })

    // Non-admin query: restrict to caller records and strip sensitive fields
    return db.records
        .find({ userId: userId })
        .project({
            compensationGrade: 0,
            riskScore: 0,
            auditNotes: 0
        })
        .sort({ createdAt: -1 })
```

Because projected fields are omitted in the database query, the server runtime never loads them into memory, and the network serializer cannot transmit them to unauthorized clients.

### Repository abstraction boundary

Controllers and services communicate exclusively through TypeScript interfaces, decoupling domain logic from database drivers:

```
interface IRecordRepository:
    findById(id: string): Promise<Record | null>
    findForUser(userId: string, role: string): Promise<Record[]>
    create(data: RecordInput): Promise<Record>
    update(id: string, data: Partial<RecordInput>): Promise<Record | null>
    delete(id: string): Promise<boolean>

class MongoRecordRepository implements IRecordRepository:
    // Mongoose driver implementation

class DynamoRecordRepository implements IRecordRepository:
    // AWS DynamoDB DocumentClient implementation
```

This abstraction allows substituting MongoDB for Amazon DynamoDB or local XML storage by registering an alternate implementation during application bootstrap, without changing a single line in controllers or services.

### Dual-mode persistence bootstrap

To ensure zero-configuration setup while preserving external database compatibility, the connection layer attempts external connection first, then falls back to an embedded instance:

```
async function initializeDatabase():
    if MONGO_URI is set:
        try:
            connect(MONGO_URI, timeout: 2000ms)
            return "Connected to External Database"
        catch:
            log("External connection failed, switching to embedded fallback")

    memoryServer = create MongoMemoryServer()
    connect(memoryServer.getUri())
    seedDatabaseIfEmpty()
    return "Connected to Embedded In-Memory Database"
```

---

## Data models and schemas

### User entity

Represents platform accounts. Used for authentication, role enforcement, and administrative account management.

```json
{
  "_id": "ObjectId",
  "userId": "string (unique, indexed)",
  "name": "string",
  "role": "General User | Admin",
  "department": "string",
  "status": "Active | Disabled",
  "passwordHash": "string (bcrypt cost 10)",
  "lastLoginAt": "ISO8601 Date",
  "createdAt": "ISO8601 Date",
  "updatedAt": "ISO8601 Date"
}
```

### Verification record entity

Represents employment screening and background audit records.

```json
{
  "_id": "ObjectId",
  "recordId": "string (unique, indexed, e.g. REC-2026-001)",
  "userId": "string (indexed foreign reference)",
  "employeeName": "string",
  "department": "string",
  "position": "string",
  "accessLevel": "General | Confidential | Executive",
  "verificationStatus": "Verified | Pending Review | Flagged",
  "backgroundCheckDate": "string (YYYY-MM-DD)",
  "compensationGrade": "string (Confidential: Admin only)",
  "riskScore": "number 1-100 (Confidential: Admin only)",
  "auditNotes": "string (Confidential: Admin only)",
  "govIdMasked": "string (Masked format: XXX-XX-1234)",
  "createdAt": "ISO8601 Date",
  "updatedAt": "ISO8601 Date"
}
```

---

## API design

All endpoints support the optional `?delay=<ms>` query parameter.

### Authentication

`POST /api/auth/login?delay=ms`
Validates user ID, password, and claimed role against stored credentials. Returns signed JWT.

Request payload:
```json
{
  "userId": "EMP-2024-001",
  "password": "Password@123",
  "role": "Admin"
}
```

Response payload (HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "userId": "EMP-2024-001",
    "name": "Sarah Jenkins",
    "role": "Admin",
    "department": "Security Audit"
  }
}
```

### Record access

`GET /api/records?delay=ms`
Returns verification records. Requires Bearer token in Authorization header. Output fields depend strictly on token role.

Admin response: Returns all records with `compensationGrade`, `riskScore`, and `auditNotes`.
General User response: Returns only caller records with confidential fields stripped.

### User management (Admin only)

`GET /api/users?delay=ms`
Returns list of registered platform users. Blocked with HTTP 403 for General Users.

`PATCH /api/users/:id?delay=ms`
Modifies user role, department, or active status.

`DELETE /api/users/:id?delay=ms`
Removes user record from the database.

---

## Key architectural decisions

### Why database query projection instead of client-side filtering?
Filtering confidential fields in Angular components or Express controllers requires the database to return full records into memory. If code in the controller fails to strip an attribute, or if an endpoint is reused, confidential data leaks over the network. Projecting fields at the database query level (`.select('-riskScore ...')`) guarantees that unauthorized attributes never load into runtime memory or serialize into HTTP responses.

### Why dual-mode persistence with in-memory fallback instead of requiring Docker?
Requiring reviewers to install Docker or run a local MongoDB daemon introduces friction and environment failures. Providing an automated fallback to an embedded in-memory MongoDB instance with pre-seeded accounts guarantees that the application runs immediately on any development machine with zero manual configuration. External MongoDB remains supported through a single environment variable (`MONGO_URI`).

### Why non-blocking middleware for latency simulation?
Using synchronous loops (`while (Date.now() < target)`) to simulate delay blocks the single-threaded Node.js event loop, preventing all concurrent requests from making progress. Using asynchronous Promise timers inside Express middleware suspends only the specific requesting connection while allowing other requests and event processing to proceed unhindered.

### Why Angular Signals instead of NgRx store?
The application manages distinct, bounded state: user authentication, active delay preferences, and verification record lists. Introducing NgRx actions, reducers, effects, and selectors adds substantial boilerplate with minimal benefit for this scale. Angular Signals provide synchronous reactivity, automatic dependency tracking, and direct template integration without RxJS subscription leaks.

---

## Reliability and failure handling

| Component | Failure mode | Mitigation |
|---|---|---|
| Database connection | External MongoDB unreachable | 2000ms connection timeout triggers fallback to embedded in-memory database. |
| Authentication | Token expired or invalid | HTTP interceptor catches 401, clears local session storage, and redirects to login. |
| Authorization | Role claim mismatch at login | Server compares requested role against stored database role and rejects spoofed requests with HTTP 403. |
| Network latency | Delay parameter exceeds limit | Middleware clamps input between 0 and 10,000 ms to prevent denial of service through arbitrary timeouts. |
| Frontend HTTP | Backend process stopped | Interceptor detects connection refusal and displays actionable terminal restart commands in UI banner. |

---

## Diagram prompts

### Architecture and data flow diagram
> Draw a clean left-to-right system architecture diagram in Excalidraw style. White background with dark gray lines and rounded rectangular nodes. Generous spacing.
>
> Nodes from left to right:
> 1. Angular 18 Client (Port 4200)
> 2. Vite Reverse Proxy (/api)
> 3. Express Application (Port 3000)
> 4. Delay Middleware (?delay=ms)
> 5. JWT and RBAC Guard
> 6. Repository Seam (IRecordRepository)
> 7. Storage Target (showing dual paths: Embedded In-Memory DB as default, External MongoDB as configured path)
>
> Label all arrows with protocol and payload type. Highlight the Repository Seam as the primary decoupling point using a distinct dashed border.

### Security and query projection flow
> Draw a top-to-bottom sequence diagram showing how a record request is handled for an Admin user versus a General User.
> Show the request entering the Record Repository.
> Branch 1: If role is Admin, query executes without field restrictions and returns full records.
> Branch 2: If role is General User, query applies filter for caller userId and projects out riskScore, compensationGrade, and auditNotes.
> Show both response payloads exiting the API boundary, highlighting that confidential fields never cross the boundary for the General User.

---

## Open questions

- **Token revocation at scale**: The current design uses stateless JWTs. In a high-concurrency production deployment with immediate user deactivations, should the system introduce a lightweight Redis blacklist, or transition to short-lived access tokens with rotating refresh tokens?
- **Field-level encryption at rest**: For strict regulatory compliance, should fields like government IDs and compensation grades be encrypted with envelope keys (e.g. AWS KMS or Tink) prior to database insertion?
