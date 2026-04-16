# Backend Link

zorvyn-backend-production-52df.up.railway.app

# Finance Dashboard Backend Link

A production-quality RESTful API for a finance dashboard application built with TypeScript, Express 5, Prisma 7, and PostgreSQL (Neon).

## Overview

This backend provides:
- **JWT-based authentication** with role-based access control (RBAC)
- **User management** with admin-only operations
- **Transaction tracking** with soft delete, filtering, and pagination
- **Dashboard analytics** with aggregated financial summaries, category breakdowns, monthly trends, and recent activity

### Assumptions

- Neon PostgreSQL is used as the database provider (any PostgreSQL instance works via `DATABASE_URL`)
- Prisma 7 with the `@prisma/adapter-pg` driver adapter is used for database access
- The project uses ESM (`"type": "module"`) with `tsx` for development
- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Soft-deleted transactions are excluded from all queries automatically

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd zorvyn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run database migrations

```bash
npm run prisma:migrate
```

### 6. Start the development server

```bash
npm run dev
```

The server starts on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication (Public)

| Method | Route               | Access | Description                      |
|--------|---------------------|--------|----------------------------------|
| POST   | `/api/auth/register` | Public | Register a new user              |
| POST   | `/api/auth/login`    | Public | Login and receive a JWT token    |

### Users (Admin Only)

| Method | Route                    | Access | Description              |
|--------|--------------------------|--------|--------------------------|
| GET    | `/api/users`             | ADMIN  | List all users (paginated) |
| GET    | `/api/users/:id`         | ADMIN  | Get user by ID            |
| PATCH  | `/api/users/:id/role`    | ADMIN  | Update user role          |
| PATCH  | `/api/users/:id/status`  | ADMIN  | Toggle active status      |
| DELETE | `/api/users/:id`         | ADMIN  | Hard delete a user        |

### Transactions (Authenticated)

| Method | Route                     | Access               | Description                 |
|--------|---------------------------|----------------------|-----------------------------|
| POST   | `/api/transactions`       | ADMIN                | Create a transaction        |
| GET    | `/api/transactions`       | VIEWER, ANALYST, ADMIN | List transactions (filtered, paginated) |
| GET    | `/api/transactions/:id`   | VIEWER, ANALYST, ADMIN | Get transaction by ID       |
| PATCH  | `/api/transactions/:id`   | ADMIN                | Update a transaction        |
| DELETE | `/api/transactions/:id`   | ADMIN                | Soft delete a transaction   |

**Query Filters for `GET /api/transactions`:**
- `type` — `INCOME` or `EXPENSE`
- `category` — case-insensitive partial match
- `startDate` — ISO date string (inclusive lower bound)
- `endDate` — ISO date string (inclusive upper bound)
- `page` — page number (default: 1)
- `limit` — items per page (default: 10, max: 100)

### Dashboard (Analyst & Admin)

| Method | Route                              | Access         | Description                        |
|--------|------------------------------------|----------------|------------------------------------|
| GET    | `/api/dashboard/summary`           | ANALYST, ADMIN | Total income, expenses, net balance |
| GET    | `/api/dashboard/category-breakdown`| ANALYST, ADMIN | Spending by category               |
| GET    | `/api/dashboard/monthly-trends`    | ANALYST, ADMIN | Monthly income/expense breakdown   |
| GET    | `/api/dashboard/recent-activity`   | ANALYST, ADMIN | Most recent transactions           |

**Query Params:**
- `GET /api/dashboard/monthly-trends?year=2026` — defaults to current year
- `GET /api/dashboard/recent-activity?limit=5` — defaults to 5

---

## Role Permission Matrix

| Action                    | VIEWER | ANALYST | ADMIN |
|---------------------------|--------|---------|-------|
| Register / Login          | Yes    | Yes     | Yes   |
| List transactions         | Yes    | Yes     | Yes   |
| View single transaction   | Yes    | Yes     | Yes   |
| Create transaction        | No     | No      | Yes   |
| Update transaction        | No     | No      | Yes   |
| Delete transaction        | No     | No      | Yes   |
| View dashboard analytics  | No     | Yes     | Yes   |
| Manage users              | No     | No      | Yes   |

---

## Soft Delete

Transactions support soft delete rather than permanent removal:

- When a `DELETE /api/transactions/:id` request is made, the transaction's `isDeleted` field is set to `true`
- All transaction queries automatically filter out soft-deleted records (`isDeleted: false`)
- Soft-deleted transactions are excluded from dashboard aggregations
- Only ADMIN users can perform soft deletes
- User deletion (`DELETE /api/users/:id`) is a hard delete

---

## Example Requests & Responses

### 1. Register a new user

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securePass123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx1abc2d0001abcdefghijkl",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "VIEWER",
      "createdAt": "2026-04-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Create a transaction (Admin)

**Request:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -d '{
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "clx2def3g0002abcdefghijkl",
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary",
    "isDeleted": false,
    "createdAt": "2026-04-01T10:35:00.000Z",
    "updatedAt": "2026-04-01T10:35:00.000Z",
    "createdById": "clx1abc2d0001abcdefghijkl",
    "createdBy": {
      "id": "clx1abc2d0001abcdefghijkl",
      "name": "Alice Johnson",
      "email": "alice@example.com"
    }
  }
}
```

### 3. Get dashboard summary (Analyst/Admin)

**Request:**
```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer <analyst-jwt-token>"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved",
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 8500,
    "netBalance": 6500,
    "totalTransactions": 42
  }
}
```

---

## Project Structure

```
src/
  config/
    db.ts                    # Prisma client singleton with PG adapter
  middlewares/
    auth.middleware.ts        # JWT verification, attaches user to req
    role.middleware.ts        # Role-based access control factory
    error.middleware.ts       # Global error handler
  modules/
    auth/                    # Registration & login
    users/                   # Admin user management
    transactions/            # CRUD with soft delete & filtering
    dashboard/               # Analytics & aggregations
  utils/
    ApiError.ts              # Custom error class with status code
    ApiResponse.ts           # Consistent success response wrapper
  app.ts                     # Express app setup, middleware, routes
  server.ts                  # Entry point
prisma/
  schema.prisma              # Database schema
```

---

## Tech Stack

| Technology   | Version | Purpose                     |
|--------------|---------|------------------------------|
| Node.js      | 20+     | Runtime                      |
| TypeScript   | 5.4+    | Type safety                  |
| Express      | 5.x     | HTTP framework               |
| Prisma       | 7.x     | ORM / query builder          |
| Neon         | —       | PostgreSQL database (cloud)  |
| Zod          | 4.x     | Request validation           |
| jsonwebtoken | —       | JWT authentication           |
| bcryptjs     | —       | Password hashing             |
| helmet       | —       | Security headers             |
| cors         | —       | Cross-origin resource sharing|
