# BrightLife EHR – Backend API

REST API for the BrightLife Enhancement Services EHR, built with
**Node.js · Express · TypeScript · PostgreSQL · Prisma**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL (Amazon RDS / Aurora PostgreSQL) |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, CORS, express-rate-limit, bcryptjs |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema – single source of truth
│   └── seed.ts            # Creates a default super admin
├── src/
│   ├── config/
│   │   └── prisma.ts      # Singleton Prisma client
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT protect + role restrict
│   │   └── error.middleware.ts  # Global error handler + 404
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── types/
│   │   └── index.ts       # Shared interfaces & AdminRole type
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── response.ts
│   │   └── validation.ts
│   ├── app.ts             # Express factory
│   └── server.ts          # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- PostgreSQL database (local or Amazon RDS)

### 2. Install

```bash
cd backend
npm install
```

### 3. Environment

```bash
cp .env.example .env
# Fill in DATABASE_URL and JWT secrets
```

### 4. Generate Prisma Client

```bash
npm run db:generate
# or: npx prisma generate
```

### 5. Run Migrations

```bash
# Development – creates migration files
npm run db:migrate

# Production – applies existing migrations only (safe for CI/CD)
npm run db:migrate:prod
```

### 6. Seed (optional)

Creates a default `superadmin@brightlife.health` account (password: `Admin@123!`).
**Change the password immediately after first login.**

```bash
npm run db:seed
```

### 7. Start

```bash
# Development (hot-reload)
npm run dev

# Production
npm run build && npm start
```

---

## AWS Deployment (RDS)

1. Create an **Amazon RDS for PostgreSQL** (or Aurora PostgreSQL) instance.
2. In your EC2 / ECS security group, allow inbound traffic on port **5432** from your app server.
3. Set `DATABASE_URL` in your environment / AWS Secrets Manager:
   ```
   postgresql://USERNAME:PASSWORD@your-rds-host.rds.amazonaws.com:5432/bles_ehr?schema=public
   ```
4. On deploy, run migrations (never `db:migrate` in production — use `db:migrate:prod`):
   ```bash
   npx prisma migrate deploy
   ```

---

## API Endpoints

### Auth

| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| `GET`  | `/health` | Public | Health check |
| `POST` | `/auth/admin/register` | Public | Register new admin |
| `POST` | `/auth/admin/login` | Public | Login → JWT tokens |

### POST `/auth/admin/register`

```json
// Request
{
  "firstName": "Jane",
  "lastName":  "Smith",
  "email":     "jane@brightlife.health",
  "password":  "securepassword"
}

// 201 Response
{
  "success": true,
  "message": "Admin account created successfully.",
  "admin": {
    "id":        "uuid…",
    "firstName": "Jane",
    "lastName":  "Smith",
    "email":     "jane@brightlife.health",
    "role":      "ADMIN",
    "isActive":  true,
    "createdAt": "2025-…"
  }
}
```

### POST `/auth/admin/login`

```json
// Request
{ "email": "jane@brightlife.health", "password": "securepassword" }

// 200 Response
{
  "success": true,
  "message": "Login successful.",
  "user": { "id": "…", "firstName": "Jane", "role": "ADMIN" },
  "accessToken":  "eyJ…",
  "refreshToken": "eyJ…"
}
```

---

## Protecting Future Routes

```typescript
import { protect, restrict } from "./middleware/auth.middleware";

// Any authenticated admin
router.get("/patients", protect, handler);

// Super admins only
router.delete("/admin/:id", protect, restrict("SUPER_ADMIN"), handler);
```

---

## Database Scripts

| Script | Command | Purpose |
|---|---|---|
| Generate client | `npm run db:generate` | Re-generate Prisma types after schema change |
| Migrate (dev) | `npm run db:migrate` | Create + apply new migration |
| Migrate (prod) | `npm run db:migrate:prod` | Apply existing migrations only |
| Seed | `npm run db:seed` | Seed initial super admin |
| Studio | `npm run db:studio` | Open Prisma visual DB browser |