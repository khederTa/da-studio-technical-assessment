# Theme Park Table Booking System — Setup & Architecture Guidelines

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features & Concepts](#core-features--concepts)
5. [Architecture Deep Dive](#architecture-deep-dive)
6. [Prerequisites](#prerequisites)
7. [Environment Variables](#environment-variables)
8. [Running with Docker (Recommended)](#running-with-docker-recommended)
9. [Running Locally (Without Docker)](#running-locally-without-docker)
10. [Database Seeding](#database-seeding)
11. [API Documentation (Swagger)](#api-documentation-swagger)
12. [API Endpoints Reference](#api-endpoints-reference)
13. [Testing](#testing)

---

## Project Overview

A full-stack **table booking system** for a multi-zoned theme park. Guests can register, browse uniquely themed restaurants across zones (Space Port, Jungle Trails, Fantasy Kingdom, etc.), check real-time table availability, and book tables — all while the system guarantees **no overbooking** under concurrent load.

The application is structured as a **monorepo** with a **NestJS** backend API and a **React** frontend, backed by **MongoDB** for persistence and **Redis** for high-speed caching, rate limiting, and concurrency control.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend framework** | NestJS 11 | Modular, decorator-driven Node.js framework |
| **Frontend framework** | React 18 + TypeScript | Component-based UI |
| **Build tool** | Vite 6 | Fast HMR dev server + production bundler |
| **Database** | MongoDB 7 (via Mongoose) | Document store for restaurants, bookings, users |
| **Cache / concurrency** | Redis 7 (via ioredis) | Atomic Lua scripts, rate limiting, response caching |
| **Auth** | Passport + JWT | Stateless bearer-token authentication (24h expiry) |
| **Password hashing** | bcrypt | Salt rounds: 10 |
| **Validation** | class-validator + Zod | Backend DTO validation + frontend schema validation |
| **API docs** | Swagger (OpenAPI) | Auto-generated interactive docs at `/docs` |
| **Containerization** | Docker + docker-compose | Local orchestration (5 services) |
| **State management** | Redux Toolkit + React Query | Client state + server-state caching |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Nginx** | reverse proxy | Serves static frontend, proxies `/api` to backend |

---

## Project Structure

```
/
├── app/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts               # Entry point, Swagger setup, CORS, global pipes
│   │   │   ├── app.module.ts         # Root module (Mongoose, Redis, Throttler, guards)
│   │   │   ├── auth/                 # Authentication module
│   │   │   │   ├── auth.controller.ts    # POST /auth/register, POST /auth/login
│   │   │   │   ├── auth.service.ts       # Register (bcrypt hash), Login (JWT sign)
│   │   │   │   ├── auth.module.ts        # JWT + Passport + Mongoose wiring
│   │   │   │   ├── jwt.strategy.ts       # Bearer token extraction + validation
│   │   │   │   ├── dto/
│   │   │   │   │   ├── register.dto.ts       # Name (sanitized), email, password (8+ chars, upper+digit)
│   │   │   │   │   ├── login.dto.ts          # Email (sanitized), password
│   │   │   │   │   ├── user-response.dto.ts  # Public user shape (id, name, email, role)
│   │   │   │   │   └── auth-response.dto.ts  # JWT token + user profile
│   │   │   │   └── schemas/
│   │   │   │       └── user.schema.ts        # Mongoose User model (name, email, password, role)
│   │   │   ├── restaurants/           # Restaurants module
│   │   │   │   ├── restaurants.controller.ts  # GET /restaurants, GET /:id, GET /:id/availability
│   │   │   │   ├── restaurants.service.ts     # CRUD + availability (reads from Booking records)
│   │   │   │   ├── restaurants.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── restaurant-response.dto.ts
│   │   │   │   │   ├── capacity-query.dto.ts      # requestedAt (ISO 8601, no past dates)
│   │   │   │   │   └── capacity-response.dto.ts   # totalCapacity, currentOccupancy, availableSeats
│   │   │   │   └── schemas/
│   │   │   │       └── restaurant.schema.ts   # TableConfig sub-document (size, count)
│   │   │   ├── bookings/               # Bookings module
│   │   │   │   ├── bookings.controller.ts    # POST /bookings, GET /bookings, DELETE /:id
│   │   │   │   ├── bookings.service.ts       # createBooking + TableAllocationEngine
│   │   │   │   ├── redis-precheck.service.ts # Lua script execution, cache seeding/invalidation
│   │   │   │   ├── bookings.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-booking.dto.ts  # restaurantId, dateSlot, partySize, idempotencyKey
│   │   │   │   │   └── booking-response.dto.ts
│   │   │   │   └── schemas/
│   │   │   │       ├── booking.schema.ts    # idempotencyKey, userId, restaurantId, dateSlot, assignedTableSize, status
│   │   │   │       └── inventory.schema.ts  # TableAvailability sub-document (size, totalTables, reservedTables)
│   │   │   ├── redis/                 # Redis module (global)
│   │   │   │   ├── redis.module.ts         # ioredis client provider, global, graceful shutdown
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── redis-throttler.storage.ts  # ThrottlerStorage implementation for rate limiting
│   │   │   │   ├── redis.constants.ts
│   │   │   │   └── scripts/
│   │   │   │       ├── allocator.lua          # Atomic Redis table allocation
│   │   │   │       └── release-allocator.lua  # Atomic Redis lease release
│   │   │   ├── common/                # Shared infrastructure
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts  # Global error handler (consistent error shape)
│   │   │   │   ├── guards/
│   │   │   │   │   └── security-throttler.guard.ts  # Per-user/IP rate limit tracking
│   │   │   │   └── decorators/
│   │   │   │       └── api-errors.decorator.ts   # Swagger error response decorators
│   │   │   ├── config/
│   │   │   │   ├── configuration.ts      # NestJS config loader
│   │   │   │   ├── config.interface.ts   # EnvironmentVariables interface
│   │   │   │   └── env.validation.ts     # Joi schema for env validation
│   │   │   ├── db/
│   │   │   │   └── seed.ts               # Seed script (reads restaurants.csv → MongoDB)
│   │   │   └── health/
│   │   │       ├── health.controller.ts  # GET /api/health
│   │   │       └── health.module.ts
│   │   ├── test/                   # E2E tests
│   │   ├── Dockerfile              # Multi-stage build (build → production)
│   │   ├── .env                    # Environment configuration template
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                        # React Frontend (Vite)
│       ├── src/
│       │   ├── main.tsx                # React entry point
│       │   ├── app/
│       │   │   ├── App.tsx             # Root component (QueryClient + Redux + Router + providers)
│       │   │   ├── routes/
│       │   │   │   ├── AppRoutes.tsx       # Route definitions with auth guards
│       │   │   │   └── routes.config.ts    # Lazy-loaded route declarations
│       │   │   ├── layouts/
│       │   │   │   ├── MainLayout.tsx      # Authenticated layout shell
│       │   │   │   └── components/Header.tsx  # Navigation bar (Restaurants, My Bookings, Sign Out)
│       │   │   ├── stores/              # Redux Toolkit
│       │   │   │   ├── store.ts
│       │   │   │   └── slices/
│       │   │   │       ├── authSlice.ts       # User session state
│       │   │   │       ├── uiSlice.ts         # Theme, language, sidebar
│       │   │   │       └── notificationSlice.ts
│       │   │   ├── providers/
│       │   │   │   ├── AuthSessionBootstrap.tsx  # Restore session from localStorage
│       │   │   │   ├── AppProviders.tsx          # Theme, Language, Notification composition
│       │   │   │   ├── ThemeProvider.tsx
│       │   │   │   ├── LanguageProvider.tsx
│       │   │   │   └── NotificationProvider.tsx
│       │   │   └── modules/
│       │   │       ├── auth/
│       │   │       │   ├── api/auth.api.ts       # useLogin, useRegister, useLogout
│       │   │       │   └── pages/
│       │   │       │       ├── SignInPage.tsx    # Login form (zod validation)
│       │   │       │       └── SignUpPage.tsx    # Registration form (zod validation)
│       │   │       ├── restaurants/
│       │   │       │   ├── api/restaurants.api.ts  # useRestaurants, useRestaurant, useAvailability
│       │   │       │   └── pages/
│       │   │       │       └── RestaurantDirectoryPage.tsx  # Browse + search restaurants
│       │   │       └── bookings/
│       │   │           ├── api/bookings.api.ts   # useUserBookings, useCreateBooking, useCancelBooking
│       │   │           └── pages/
│       │   │               ├── BookingFormPage.tsx    # Date/time/party selector + availability indicator
│       │   │               └── BookingManagementPage.tsx  # View + cancel bookings
│       │   ├── components/ui/     # Reusable UI components (Button, Card, Badge, Dialog, Input, etc.)
│       │   ├── lib/
│       │   │   ├── api-client.ts      # Axios instance with JWT interceptor + 401 redirect
│       │   │   ├── query-client.ts    # React Query defaults (staleTime, gcTime)
│       │   │   ├── i18n.ts            # i18next setup (EN/AR, language detection)
│       │   │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
│       │   ├── locales/
│       │   │   ├── en.json            # English translations
│       │   │   └── ar.json            # Arabic translations (RTL support)
│       │   └── styles/
│       │       └── globals.css        # Tailwind base + CSS variables + dark mode
│       ├── index.html
│       ├── Dockerfile                 # Build → nginx static serving
│       ├── nginx.conf                 # Proxy /api to backend, serve SPA
│       ├── tailwind.config.js
│       ├── vite.config.ts
│       └── package.json
│
├── data/
│   └── restaurants.csv                # Seed data (5 restaurants, multiple table sizes)
│
├── docker-compose.yml                 # 5-service orchestration
├── guidelines.md                      # This file
├── ARCHITECTURE.md                    # Overbooking prevention detailed write-up
└── README.md                          # Assessment instructions
```

---

## Core Features & Concepts

### 1. Authentication & Security
- **JWT-based authentication** with 24-hour expiry, transmitted via `Authorization: Bearer <token>` header
- **bcrypt password hashing** (salt rounds: 10) — passwords never returned in API responses
- **Rate limiting** (3 tiers):
  - *General API*: 100 requests/minute per user/IP (1-minute block)
  - *Login*: 5 attempts per 15 minutes per IP (15-minute block)
  - *Bookings*: 10 per hour per authenticated user (1-hour block)
- **Input sanitization**: All text fields (name, email) are HTML-sanitized via `sanitize-html`
- **Input validation**: Email format verified, names 2–100 chars (letters/spaces only), passwords require 8+ chars with uppercase + digit, past dates rejected
- **CORS**: Configured to only allow the frontend origin
- **Consistent error responses**: Global `HttpExceptionFilter` returns `{ statusCode, timestamp, path, method, error, message }`

### 2. Restaurant Directory
- 5 themed restaurants seeded from CSV: Pirate's Galley, Dino Bites Grill, Rocket Diner, Jungle Feast, Kingdom Café
- Each restaurant has multiple table configurations (e.g., 2-tops, 4-tops, 6-tops, 8-tops)
- Real-time search by name, cuisine, or city
- Redis-cached restaurant list/detail (5-minute TTL, invalidated on booking changes)

### 3. Booking Engine
- **Smallest-suitable-table algorithm**: A party of 2 gets a 2-top if available, falling back to 4-top, 6-top, etc.
- **Two-phase concurrency control** (see [Architecture Deep Dive](#architecture-deep-dive)):
  - Phase 1: Redis Lua script for fast atomic pre-check + lease
  - Phase 2: MongoDB `findOneAndUpdate` with `$expr` + `arrayFilters` for authoritative allocation
- **Idempotency**: Each booking carries an `idempotencyKey` to prevent duplicates from retry
- **Rollback**: If MongoDB allocation fails, Redis lease is automatically released via `release-allocator.lua`
- **Cache invalidation**: On booking create/cancel, Redis availability cache + restaurant caches are cleared

### 4. Availability Checking
- Computed from **actual CONFIRMED Booking records** (source of truth) — guaranteed correct after restart
- Redis-cached with **30-second TTL** for fast repeated reads
- Returns `totalCapacity`, `currentOccupancy`, `availableSeats`, `hasVacancy`
- Past-date validation enforced at the API level

### 5. User Bookings Management
- Authenticated users can view all their bookings (sorted newest first)
- Cancel bookings with confirmation dialog
- Cancellation releases table capacity and invalidates all relevant caches

### 6. Frontend Features
- **Responsive design**: Mobile + desktop layouts using Tailwind CSS
- **Arabic (RTL) + English (LTR)**: Full i18n support via i18next, including date/time formatting
- **Dark mode**: CSS variable-based theming with localStorage persistence
- **Real-time availability**: Visual progress bar showing occupancy percentage
- **Zod validation**: Client-side form validation mirrors backend rules
- **React Query**: Server-state caching with automatic refetch on mutations
- **Redux Toolkit**: Client state management for auth + UI (theme, language)

---

## Architecture Deep Dive

### Overbooking Prevention (Two-Phase Locking)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │ ──► │  Redis   │ ──► │ MongoDB  │
│ Request  │     │  Lua     │     │ Atomic   │
│          │     │  Script  │     │ Update   │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │   POST /bookings                │
     │────────────────►               │
     │                 │               │
     │          preCheckAndLease()     │
     │                 │──────────────►│
     │                 │  allocator.lua│
     │                 │  (atomic RMW) │
     │                 │◄──────────────│
     │                 │  returns size │
     │                 │               │
     │          allocateBestFitTable() │
     │                 │──────────────►│
     │                 │  findOneAndUpdate
     │                 │  ($expr + $inc)
     │                 │◄──────────────│
     │                 │               │
     │          Booking.create()       │
     │                 │──────────────►│
     │◄────────────────│───────────────│
     │  BookingResponse               │
```

**Why two phases?**
- **Redis alone**: Fast but not durable (data loss on restart)
- **MongoDB alone**: Durable but slower for read-heavy workloads
- **Two-phase**: Fast pre-check via Redis + durable persistence via MongoDB + rollback on failure

**The Lua scripts** (`allocator.lua`, `release-allocator.lua`) execute atomically in Redis — no race conditions between read and write. The MongoDB update uses `$expr` to conditionally increment only if `reservedTables < totalTables`, preventing overbooking even if two requests arrive simultaneously.

### Rate Limiting Architecture

Rate limit counters are stored in Redis using a custom `RedisThrottlerStorage` that implements NestJS's `ThrottlerStorage` interface. The `SecurityThrottlerGuard` tracks by authenticated user ID when available, falling back to IP address for unauthenticated requests. Blocking is enforced at the storage level — once a limit is exceeded, subsequent requests are immediately rejected until the block expires.

### Caching Strategy

| Cache | Key Pattern | TTL | Invalidated On |
|---|---|---|---|
| Restaurant list | `restaurants:list` | 5 min | Booking create/cancel |
| Restaurant detail | `restaurants:detail:{id}` | 5 min | Booking create/cancel |
| Availability | `availability:{id}:{dateSlot}` | 30 sec | Booking create/cancel (direct delete) |
| Inventory (engine) | `inventory:{id}:{dateSlot}` | 24 hr | Booking cancel (direct delete) |

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Docker Desktop** >= 4.0 (for containerized setup)
- **Docker Compose** V2 (included with Docker Desktop)

---

## Environment Variables

### API — `app/api/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | No | `3000` | API server port |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | JWT signing key (minimum 32 characters) |
| `JWT_EXPIRES_IN` | No | `24h` | JWT token expiry duration |
| `REDIS_URL` | **Yes** | — | Redis connection URL (e.g., `redis://localhost:6379`) |
| `CORS_ORIGIN` | **Yes** | — | Allowed frontend origin (e.g., `http://localhost:5173` or `http://localhost`) |
| `CSV_PATH` | No | (auto-resolved) | Override path to `restaurants.csv` for seeding |

### Web — `app/web/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `window.location.origin` | API base URL in production |
| `VITE_API_PROXY_TARGET` | No | `http://localhost:3000` | Dev server proxy target for `/api` |

---

## Running with Docker (Recommended)

### Quick Start

```bash
# From the project root
docker-compose up --build
```

This orchestrates **5 services** defined in `docker-compose.yml`:

| Service | Container Name | Image | Port | Depends On | Purpose |
|---|---|---|---|---|---|
| `mongodb` | `da-studio-mongodb` | `mongo:latest` | 27017 | — | Primary database with health check |
| `redis` | `da-studio-redis` | `redis:latest` | 6379 | — | Cache + rate limiting + concurrency |
| `api` | `da-studio-api` | built from `app/api/Dockerfile` | 3000 | mongodb (healthy), redis (healthy) | NestJS backend |
| `seed` | `da-studio-seed` | built from `app/api/Dockerfile` | — | mongodb (healthy) | One-shot data seeder |
| `web` | `da-studio-web` | built from `app/web/Dockerfile` | 80 | api | React SPA via nginx |

### Service Details

**MongoDB**: Credentials configured via environment variables (`kheder_admin` / `super_secure_password`). Data persisted to a named Docker volume `mongo_data`.

**Redis**: Data persisted to `redis_data` volume (note: Redis requires explicit `save` configuration for RDB snapshots; by default data is in-memory and will reset on container restart).

**API**: Multi-stage Docker build — dev dependencies installed for compilation, then pruned to production-only in the final image. Uses `tini` as init system for proper signal handling. The `/data` volume mount provides access to `restaurants.csv` for the seed service.

**Seed**: Runs once on startup with `node dist/db/seed.js`. To re-run after seeding:
```bash
docker-compose run --rm seed
```

**Web**: Built in two stages — Node.js for Vite production build, then nginx-alpine to serve static files. The nginx config:
- Proxies `/api/*` requests to the `api` container at `http://api:3000`
- Serves the SPA with `try_files` fallback to `index.html`
- Caches static assets (CSS/JS/fonts) for 6 months with `immutable`

### Stopping

```bash
# Stop containers (data volumes preserved)
docker-compose down

# Stop containers AND delete volumes (WARNING: loses all data)
docker-compose down -v
```

### Architecture Diagram

```
┌─────────────┐      ┌─────────────┐
│   Browser   │      │   Browser   │
│  :80 (web)  │      │  :5173 (dev)│
└──────┬──────┘      └──────┬──────┘
       │ GET /api/*         │ GET /api/*
       │                     │ (Vite proxy)
       ▼                     ▼
┌──────────────────────────────────┐
│          nginx (web)             │
│  location /api → proxy_pass     │
│  location / → try_files index   │
└──────────────┬───────────────────┘
               │ http://api:3000
               ▼
┌──────────────────────────────────┐
│       NestJS API (api:3000)      │
│  ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │  Restaurants │  │
│  │  Module  │ │  Module      │  │
│  └────┬─────┘ └──────┬───────┘  │
│       │              │          │
│  ┌────▼──────────────▼───────┐  │
│  │     Bookings Module       │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ RedisPreCheckService │  │  │
│  │  │  (Lua Scripts)      │  │  │
│  │  └──────────┬──────────┘  │  │
│  │  ┌──────────▼──────────┐  │  │
│  │  │TableAllocationEngine│  │  │
│  │  │ (MongoDB atomic)    │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌────────┐   ┌──────────────┐  │
│  │ Redis  │   │   MongoDB    │  │
│  │:6379   │   │  :27017      │  │
│  └────────┘   └──────────────┘  │
└──────────────────────────────────┘
```

---

## Running Locally (Without Docker)

### 1. Start Dependencies

Ensure **MongoDB** and **Redis** are running locally on their default ports (27017 and 6379).

### 2. API Setup

```bash
cd app/api
npm install
cp .env .env.local

# Edit .env.local with your connection details:
#   MONGO_URI=mongodb://localhost:27017/da-studio-assessment
#   REDIS_URL=redis://localhost:6379
#   JWT_SECRET=<your-32-char-min-secret>
#   CORS_ORIGIN=http://localhost:5173

npm run db:seed        # Seed restaurants from data/restaurants.csv
npm run start:dev      # Start API (watch mode) at http://localhost:3000
```

### 3. Web Setup

```bash
cd app/web
npm install
npm run dev            # Start Vite dev server at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3000` (configured in `vite.config.ts`), so the frontend works seamlessly without CORS issues during development.

### 4. Verify

- **API**: `curl http://localhost:3000/api/health` → `{ "status": "ok", "timestamp": "..." }`
- **Restaurants**: `curl http://localhost:3000/api/restaurants` → JSON array of 5 restaurants
- **Swagger**: Open `http://localhost:3000/docs` in your browser
- **Frontend**: Open `http://localhost:5173`

---

## Database Seeding

The seed script (`app/api/src/db/seed.ts`) reads `data/restaurants.csv` and populates the `Restaurant` collection.

### CSV Format

```csv
restaurant_name,location,table_size,table_count
Pirate's Galley,Adventure Zone,2,5
Pirate's Galley,Adventure Zone,4,3
...
```

Restaurants with the same name across multiple rows are consolidated into a single document with all their table configurations.

### Run Seed

```bash
# Local (from app/api/)
npm run db:seed

# Docker
docker-compose run --rm seed

# With custom CSV path
CSV_PATH=/custom/path/restaurants.csv npm run db:seed
```

The seed is idempotent — it calls `deleteMany({})` before inserting, so re-running replaces all data.

---

## API Documentation (Swagger)

The API is fully documented with **Swagger/OpenAPI** via `@nestjs/swagger`.

- **URL**: `http://localhost:3000/docs` (or your deployed API URL + `/docs`)
- **Auth**: Click the "Authorize" button and paste your JWT token (`Bearer <token>`) to test protected endpoints
- **Persistence**: The "persistAuthorization" option is enabled, so your token survives page refreshes

All DTOs, response types, error codes, and endpoint descriptions are documented. Each endpoint includes:
- Request body/query parameter schemas
- Response status codes (200, 201, 400, 401, 404, 409, 429)
- Authentication requirements
- Rate limit headers

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ name, email, password }` | `201` — `{ id, name, email, role, scopeUserId }` | `400` — validation or email exists |
| POST | `/api/auth/login` | No | `{ email, password }` | `200` — `{ access_token, user }` | `401` — invalid credentials, `429` — too many attempts |

### Restaurants

| Method | Endpoint | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/api/restaurants` | No | — | `200` — Array of restaurants | — |
| GET | `/api/restaurants/:id` | No | — | `200` — Single restaurant | `404` |
| GET | `/api/restaurants/:id/availability` | No | `?requestedAt=ISO8601` | `200` — `{ totalCapacity, currentOccupancy, availableSeats, hasVacancy }` | `400` — past date, `404` |

### Bookings (all require JWT)

| Method | Endpoint | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| POST | `/api/bookings` | Yes | `{ restaurantId, dateSlot, partySize, idempotencyKey }` | `201` — Booking created | `400` — validation, `409` — no capacity, `429` — rate limit |
| GET | `/api/bookings` | Yes | — | `200` — Array of user's bookings | `401` |
| DELETE | `/api/bookings/:id` | Yes | — | `200` — Cancelled booking | `403` — not owner, `404`, `400` — already cancelled |

### Health

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/api/health` | No | `{ status: "ok", timestamp: "..." }` |

### Standard Error Response Shape

All errors follow this structure:

```json
{
  "statusCode": 400,
  "timestamp": "2026-06-23T12:00:00.000Z",
  "path": "/api/bookings",
  "method": "POST",
  "error": "Bad Request",
  "message": "Validation failed (etc.)"
}
```

---

## Testing

```bash
# Unit tests (API)
cd app/api
npm test                  # Run all .spec.ts files
npm run test:watch       # Watch mode
npm run test:cov         # With coverage report

# E2E tests (API)
npm run test:e2e         # Requires running MongoDB

# Frontend (lint)
cd app/web
npm run lint
```
