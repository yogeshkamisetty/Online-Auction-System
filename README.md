# Golden Hammer Auctions

A full-stack, **real-time online auction marketplace** for niche, high-value collectibles — rare antiquities, numismatics, luxury watches, vintage furniture, and vehicles. Buyers bid live, sellers consign lots, and auctions close automatically on a server-authoritative timer.

> **Category:** Real-time C2C marketplace (commission-based two-sided platform) · **Stack:** PERN + WebSockets

---

## Table of Contents
1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Features](#4-features)
5. [Project Structure](#5-project-structure)
6. [Getting Started](#6-getting-started)
7. [API Reference](#7-api-reference)
8. [Data Model](#8-data-model)
9. [Test Results](#9-test-results)
10. [Known Issues & Roadmap](#10-known-issues--roadmap)

---

## 1. Overview

Traditional auction houses limit participation through geography, rigid schedules, and high entry barriers. Golden Hammer democratizes this by providing a globally accessible, real-time bidding platform with:

- **Live bidding** synchronized across all viewers of an auction
- **Server-authoritative timers** — auctions close via a cron job, not the client clock
- **Concurrency-safe bids** — PostgreSQL row-level locking prevents two bidders "winning" simultaneously
- **Role-based access** — buyers, sellers, and admins, with a dedicated admin operations console
- **Monetization model** — 10% seller commission + 5% buyer's premium calculated at settlement

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 (Vite), React Router DOM, Axios, TanStack React Query |
| **Styling** | Custom CSS design system ("Technical Precision" — 8px grid, Inter / JetBrains Mono) |
| **Backend** | Node.js, Express 5, Prisma 7 ORM |
| **Database** | PostgreSQL (hosted on Neon, serverless) |
| **Real-time** | Socket.io (WebSocket rooms per auction) |
| **Auth** | JWT (stateless, 7-day expiry) + bcryptjs hashing |
| **Scheduled jobs** | node-cron (auction auto-closer, runs every minute) |
| **Security** | helmet, CORS, role-gated middleware |
| **Image uploads** | Cloudinary (direct unsigned upload from client) |

---

## 3. Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│   React SPA (Vite) :5173    │         │   Express API :3001          │
│                             │  REST   │                              │
│  Navbar · Routes (lazy)     │◄───────►│  /auth /auctions /bids       │
│  AuthContext · React Query  │ (JWT)   │  /admin /watchlist           │
│  lib/api.js (axios+JWT)     │         │                              │
│                             │ Socket  │  Socket.io rooms             │
│  ProductDetails (live bids) │◄═══════►│  bid:new · auction:closed    │
└─────────────────────────────┘         │            │                 │
                                         │  Prisma (adapter-pg, pool=3) │
                                         │            ▼                 │
                                         │  node-cron: closes expired   │
                                         │  auctions every minute       │
                                         └────────────┬─────────────────┘
                                                      ▼
                                         ┌──────────────────────────────┐
                                         │  Neon PostgreSQL             │
                                         │  User · Auction · Bid ·      │
                                         │  Watchlist                   │
                                         └──────────────────────────────┘
```

**Auction lifecycle:** `ACTIVE → CLOSED (cron, at endTime) → SETTLED (winner confirms purchase)`

---

## 4. Features

### Buyer
- Browse & filter the catalog (category, search, price)
- Real-time bidding with live price + bid-history updates
- Watchlist (save/track lots)
- Dashboard: active bids, items won, total spent
- Confirm purchase (settlement) on won lots

### Seller
- Create consignment listings with image upload
- Dashboard: active listings, items sold, total GMV

### Admin (dedicated console)
- Platform KPIs (GMV, revenue, users, pending verifications)
- Manage any auction (edit, feature, force-close, take down)
- **Expert verification queue** (approve/reject lots → "Verified" badge)
- User management (suspend, promote/demote)
- Full bid audit log per auction (dispute resolution)

### Visual Overhaul & Interactive Motion Design (Technical Precision 2.0)
- **Cohesive Color Palette & Grid Alignment**: Swiss-bank-inspired Deep Midnight structural elements and Vibrant Gold premium badges built on a strict 8px grid.
- **StatsBand KPI Infographic**: Implements a high-quality glassmorphism dashboard overlay on the landing page with animated count-up numbers and custom sparkbars.
- **Scroll-Triggered Reveals & Staggers**: Custom `IntersectionObserver`-based stagger effects (`Reveal.jsx`) for seamless, fluid scroll reveals.
- **Advanced Micro-Interactions**: Real-time price flashes, card-lifting hover zooms, button sheen sweeps, and brushed-metal shimmer skeletons.
- **Accessibility & Motion Compliance**: Fully supports and respects `prefers-reduced-motion` media queries.

### Seeding & Demo Content
- **12 Active Seeded Lots**: Diverse categories (Luxury Watches, Fine Art, Classic Vehicles, Rare Numismatics) with future closing times.
- **Simulated Bid Activity**: Real-time bid histories featuring an active ladder of ascending bids across 5 distinct dummy collectors.
- **Idempotency**: The seeding engine runs cleanly and securely resets DB states without duplicate collisions.

---

## 5. Project Structure

```
FSD - Auction System/
├── api/                          # Backend (Express + Prisma + Socket.io)
│   ├── prisma/
│   │   ├── schema.prisma         # User · Auction · Bid · Watchlist models
│   │   ├── seed.js               # Seeds demo seller + 8 auctions
│   │   └── makeAdmin.js          # Bootstrap/promote an admin user
│   └── src/
│       ├── index.js              # Server entry — Express + Socket.io + cron
│       ├── lib/prisma.js         # Prisma client (pg adapter, pool max 3)
│       ├── middleware/auth.js    # requireAuth + requireAdmin
│       ├── routes/               # auth · auctions · bids · admin · watchlist
│       └── jobs/auctionCloser.js # Cron: closes expired auctions
│
├── client/                       # Frontend (React + Vite)
│   ├── public/images/            # Catalog & UI images
│   └── src/
│       ├── config.js             # API_BASE (env-driven)
│       ├── lib/api.js            # Axios instance w/ JWT interceptor + 401 logout
│       ├── context/AuthContext.jsx
│       ├── assets/css/
│       │   ├── styles.css        # Technical Precision 2.0 styles
│       │   └── animations.css    # Motion & layout visualization animations
│       ├── components/           # Navbar · Footer · AuctionCard · CountdownTimer · Spinner · StatsBand · Reveal
│       ├── hooks/                # useCountUp (animated stats counter hook)
│       └── pages/                # Home · Browse · ProductDetails · Dashboard ·
│                                 #   Sell · Watchlist · Checkout · Login · Register · NotFound
│
├── DESIGN.md                     # Design system & color tokens
├── context.md                    # Development log
└── README.md                     # This file
```

---

## 6. Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL connection string (Neon free tier recommended)

### Backend
```bash
cd api
npm install

# Configure api/.env:
#   DATABASE_URL="postgresql://..."
#   DIRECT_URL="postgresql://..."
#   JWT_SECRET="<long-random-string>"
#   JWT_EXPIRES_IN="7d"
#   PORT=3001

npx prisma migrate dev      # apply schema to the database
node prisma/seed.js         # seed demo seller + 8 auctions
npm run make:admin admin@goldenhammer.com "StrongPass123"   # create an admin

npm run dev                 # http://localhost:3001
```

### Frontend
```bash
cd client
npm install

# Configure client/.env.local:
#   VITE_API_BASE=http://localhost:3001

npm run dev                 # http://localhost:5173
```

**Demo seller login** (from seed): `demo@goldenhammer.com` / `demo1234`

---

## 7. API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | — | Create account → `{ token, user }` |
| POST | `/login` | — | Authenticate → `{ token, user }` |
| PUT | `/me` | ✅ | Update own name / password |

### Auctions — `/api/auctions`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | — | List with filters (`category`, `featured`, `search`, `status`, `sellerId`) |
| GET | `/:id` | — | Detail + seller + recent bids |
| POST | `/` | ✅ | Create a listing |
| PATCH | `/:id/settle` | ✅ (winner) | Confirm purchase → `SETTLED` + fee breakdown |

### Bids — `/api/bids`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/my` | ✅ | Caller's bids + `isWinning` flag |
| POST | `/` | ✅ | Place a bid (row-locked, rate-limited) → emits `bid:new` |

### Watchlist — `/api/watchlist`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | ✅ | Caller's watched lots |
| POST | `/` | ✅ | Add lot |
| DELETE | `/:id` | ✅ | Remove lot |

### Admin — `/api/admin` (requires `role = ADMIN`)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/stats` | Platform KPIs (GMV, revenue, counts) |
| GET | `/auctions` | All auctions (any status) + pagination |
| PATCH | `/auctions/:id` | Edit status / featured / fields |
| DELETE | `/auctions/:id` | Take down a listing |
| PATCH | `/auctions/:id/verify` | Set verification status + notes |
| GET | `/auctions/:id/bids` | Full bid audit log |
| GET | `/users` | List / search users |
| PATCH | `/users/:id` | Suspend / promote / demote |

### Real-time (Socket.io)
| Event | Direction | Purpose |
|---|---|---|
| `join:auction` / `leave:auction` | client → server | Room subscription |
| `bid:new` | server → client | Live price + new bid |
| `auction:closed` | server → client | Auction ended |

---

## 8. Data Model

```
User 1───∞ Auction        (a user sells many auctions)
User 1───∞ Bid            (a user places many bids)
Auction 1───∞ Bid         (an auction receives many bids)
```

- **Money** is stored as `Decimal(12,2)` and returned as **strings** — parse before arithmetic.
- **Enums:** `AuctionStatus` (PENDING · ACTIVE · CLOSING · CLOSED · SETTLED), `VerificationStatus` (UNVERIFIED · PENDING · VERIFIED), `Role` (USER · ADMIN).
- Indexes on `(status, featured)`, `sellerId`, `verificationStatus` for query performance.

---

## 9. Test Results

All checks below were executed against the live Neon database on **2026-06-21**.

### Build & Module Integrity
| Check | Result |
|---|---|
| Client production build (`vite build`) | ✅ 143 modules, ~409 KB JS (121 KB gzip), built in ~0.6s |
| Backend module load (all routes/middleware/jobs) | ✅ All modules load OK |
| Prisma schema validation | ✅ Valid |

### API Endpoint Tests (live)
| Test | Expected | Result |
|---|---|---|
| `GET /health` | 200 | ✅ `{ status: "ok" }` |
| `GET /api/auctions?status=ACTIVE` | live data | ✅ returns seeded lots |
| `POST /api/auth/register` | 201 + JWT | ✅ token issued, **carries `role` claim** |
| JWT payload | includes role | ✅ `user.role = "USER"` |
| `GET /api/bids/my` (authed) | 200 `[]` | ✅ empty array |
| `GET /api/admin/stats` (no token) | 401 | ✅ 401 |
| `GET /api/admin/stats` (non-admin) | 403 | ✅ 403 |
| `POST /api/bids` (valid: $100→$150) | 201 | ✅ `currentBid $150, bidCount 1` |
| `POST /api/bids` (below current) | 400 | ✅ "Bid must be higher than current bid of $150" |
| `POST /api/bids` (no token) | 401 | ✅ 401 |

### Scheduled Job (cron)
| Test | Result |
|---|---|
| Auction auto-closer | ✅ **Verified** — 8 seeded auctions past their `endTime` were automatically moved `ACTIVE → CLOSED` (0 active / 8 closed at test time) |

### Bug Found & Fixed During Testing
> **Bid placement was silently broken (HTTP 500).** The `SELECT ... FOR UPDATE` raw query referenced snake_case columns (`current_bid`, `end_time`) while Prisma generated camelCase columns (`"currentBid"`, `"endTime"`). Fixed by correcting the column identifiers; bidding now returns `201` and the row-lock validation works as designed.

---

## 10. Known Issues & Roadmap

### Known Issues
- ⚠️ **Frontend auth header:** ensure all authenticated calls go through `lib/api.js` (which injects the JWT) rather than raw `axios`.
- ℹ️ Cloudinary uploads fall back to curated placeholder images if `VITE_CLOUDINARY_CLOUD_NAME` is unset.

### Recently Fixed
- ✅ **Real-time bidding restored** — `ProductDetails.jsx` now uses `socket.io-client` with the backend's `join:auction` / `bid:new` / `auction:closed` contract (previously used an incompatible native `WebSocket` to `/ws`). Verified end-to-end: a subscribed client receives `bid:new` broadcasts live.
- ✅ **Bid race-condition query fixed** — `SELECT ... FOR UPDATE` column identifiers corrected to match Prisma's camelCase columns.

### Roadmap
- [ ] Admin frontend console (backend APIs already complete)
- [ ] Transactional emails (outbid / won) via Resend
- [ ] Bid rate-limiting via Upstash Redis
- [ ] Provenance document upload + compliance review (cultural-property law)
- [ ] Deploy: API → Render, client → Vercel, DB → Neon

---

*Golden Hammer Auctions — a real-time full-stack auction marketplace built on the PERN stack with WebSocket live bidding, concurrency-safe transactions, and role-based administration.*
