<div align="center">

# 🔨 Golden Hammer Auctions

### A real-time, full-stack auction marketplace for rare & high-value collectibles

*Bid live. Settle securely. Built for antiquities, numismatics, luxury watches, fine art, and classic vehicles.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Real-Time Events](#real-time-events)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Verification & Test Results](#verification--test-results)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

Traditional auction houses gatekeep participation through geography, rigid schedules, and steep entry barriers. **Golden Hammer Auctions** is a globally accessible web platform that brings live, competitive bidding to a discerning collector audience — engineered with the rigor a financial-grade marketplace demands.

The platform handles the **hard problems of real auctions**: concurrent bids that must never both "win," server-authoritative timers that can't be gamed by a client clock, and a full lifecycle from listing through settlement — with a dedicated admin console for curation, verification, and dispute resolution.

| | |
|---|---|
| **Category** | Real-time C2C marketplace (commission-based, two-sided) |
| **Monetization** | 10% seller commission + 5% buyer's premium, computed at settlement |
| **Differentiators** | Live bidding · expert verification · server-side auction closing |

---

## Key Features

### 🛒 For Buyers
- Browse and filter a curated catalog (category, search, price)
- **Real-time bidding** — current price and bid history update live across every viewer
- Watchlist to track lots of interest
- Personal dashboard: active bids, items won, total spent
- Secure checkout & settlement on won lots (buyer's premium, escrow-style flow)

### 🏷️ For Sellers
- **Premium Consignment Registry** — multi-step wizard with live auction preview card
- Create consignment listings with image upload (Cloudinary)
- Seller dashboard: active listings, items sold, gross merchandise value (GMV)

### 🛡️ For Administrators *(dedicated console)*
- Platform KPIs — GMV, revenue, users, pending verifications
- Manage any auction — edit, feature, force-close, take down
- **Expert verification queue** — approve/reject lots to award a "Verified" badge
- User management — suspend, promote/demote (with self-lockout safeguards)
- Full per-auction bid audit log for dispute resolution

### ⚙️ Engineering Highlights
- **Concurrency-safe bids** — PostgreSQL `SELECT … FOR UPDATE` row-level locking inside a transaction
- **Server-authoritative timers** — a `node-cron` job closes expired auctions every minute and broadcasts closure
- **Stateless JWT auth** with role-based access control and bcrypt password hashing
- **Real-time layer** — Socket.io rooms scoped per auction

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 · Vite · React Router · TanStack React Query · Axios |
| **Real-time (client)** | `socket.io-client` |
| **Styling** | Custom CSS design system ("Technical Precision") — design tokens, 8px grid, Geist / Inter / JetBrains Mono |
| **Backend** | Node.js · Express 5 · Prisma 7 ORM |
| **Database** | PostgreSQL (Neon serverless) via `@prisma/adapter-pg` |
| **Real-time (server)** | Socket.io 4.8 |
| **Auth & Security** | JWT · bcryptjs · Helmet · CORS · role-gated middleware |
| **Scheduled jobs** | node-cron |
| **Media** | Cloudinary (image upload) |

---

## System Architecture

```
┌──────────────────────────────┐         ┌───────────────────────────────┐
│   React SPA (Vite)            │  REST   │   Express API                 │
│                               │ ◄─────► │                               │
│  • Pages (Home, Browse,       │  (JWT)  │  /auth    /auctions   /bids   │
│    Product, Dashboard, Sell,  │         │  /admin   /watchlist          │
│    Checkout, Admin …)         │         │                               │
│  • AuthContext · ToastContext │ Socket  │  Socket.io rooms              │
│  • React Query cache          │ ◄═════► │  bid:new · auction:closed     │
│  • lib/api.js (JWT interceptor)│        │            │                  │
└──────────────────────────────┘         │  Prisma (adapter-pg, pool=3)  │
                                          │            ▼                  │
                                          │  node-cron — closes expired   │
                                          │  auctions every minute        │
                                          └────────────┬──────────────────┘
                                                       ▼
                                          ┌───────────────────────────────┐
                                          │   Neon PostgreSQL              │
                                          │   User · Auction · Bid ·       │
                                          │   Watchlist                    │
                                          └───────────────────────────────┘
```

**Auction lifecycle:**

```
PENDING ──▶ ACTIVE ──▶ CLOSED ──▶ SETTLED
            (live)   (cron @end)  (winner confirms purchase)
```

---

## Data Model

```
User 1───∞ Auction      a user can sell many auctions
User 1───∞ Bid          a user can place many bids
Auction 1───∞ Bid       an auction receives many bids
User 1───∞ Watchlist    a user can watch many auctions
```

**Notes for contributors**
- Monetary fields are `Decimal(12,2)` and serialized as **strings** — parse before arithmetic.
- Enums: `AuctionStatus` (PENDING · ACTIVE · CLOSING · CLOSED · SETTLED), `VerificationStatus` (UNVERIFIED · PENDING · VERIFIED), `Role` (USER · ADMIN).
- Indexes on `(status, featured)`, `sellerId`, and `verificationStatus` for query performance.

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A **PostgreSQL** connection string ([Neon](https://neon.tech) free tier recommended)

### 1 · Backend API

```bash
cd api
npm install

# Configure api/.env (see Environment Variables below)

npx prisma migrate dev      # apply schema to the database
node prisma/seed.js         # seed demo seller, bidders, and 12 live auctions
npm run make:admin admin@goldenhammer.com "StrongPass123"   # create an admin

npm run dev                 # API → http://localhost:3001
```

### 2 · Frontend Client

```bash
cd client
npm install

# Configure client/.env.local:
#   VITE_API_BASE=http://localhost:3001

npm run dev                 # App → http://localhost:5173
```

### Demo Credentials *(after seeding)*

| Role | Email | Password |
|---|---|---|
| Seller | `demo@goldenhammer.com` | `demo1234` |
| Bidder | `bidder1@goldenhammer.com` | `demo1234` |

---

## Environment Variables

### `api/.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string (Neon) |
| `DIRECT_URL` | Direct connection string (used for migrations) |
| `JWT_SECRET` | Long random secret for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | API port (default `3001`) |

### `client/.env.local`
| Variable | Description |
|---|---|
| `VITE_API_BASE` | Base URL of the API (e.g. `http://localhost:3001`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | *(optional)* enables real image upload |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | *(optional)* unsigned upload preset |

> 🔒 `.env` files are git-ignored. Never commit credentials.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Purpose |
|---|---|:---:|---|
| `POST` | `/register` | — | Create account → `{ token, user }` |
| `POST` | `/login` | — | Authenticate → `{ token, user }` |
| `PUT` | `/me` | ✅ | Update own name / password |

### Auctions — `/api/auctions`
| Method | Endpoint | Auth | Purpose |
|---|---|:---:|---|
| `GET` | `/` | — | List with filters: `category`, `featured`, `search`, `status`, `sellerId` |
| `GET` | `/:id` | — | Auction detail + seller + recent bids |
| `POST` | `/` | ✅ | Create a listing |
| `PATCH` | `/:id/settle` | ✅ | Winner confirms purchase → `SETTLED` + fee breakdown |

### Bids — `/api/bids`
| Method | Endpoint | Auth | Purpose |
|---|---|:---:|---|
| `GET` | `/my` | ✅ | Caller's bids + `isWinning` flag |
| `POST` | `/` | ✅ | Place a bid (row-locked transaction) → emits `bid:new` |

### Watchlist — `/api/watchlist`
| Method | Endpoint | Auth | Purpose |
|---|---|:---:|---|
| `GET` | `/` | ✅ | Caller's watched lots |
| `POST` | `/` | ✅ | Add a lot |
| `DELETE` | `/:id` | ✅ | Remove a lot |

### Admin — `/api/admin` *(requires `role = ADMIN`)*
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/stats` | Platform KPIs (GMV, revenue, counts) |
| `GET` | `/auctions` | All auctions (any status) + pagination |
| `PATCH` | `/auctions/:id` | Edit status / featured / fields |
| `DELETE` | `/auctions/:id` | Take down a listing |
| `PATCH` | `/auctions/:id/verify` | Set verification status + notes |
| `GET` | `/auctions/:id/bids` | Full bid audit log |
| `GET` | `/users` | List / search users |
| `PATCH` | `/users/:id` | Suspend / promote / demote |

---

## Real-Time Events

Socket.io rooms are scoped per auction id.

| Event | Direction | Purpose |
|---|---|---|
| `join:auction` / `leave:auction` | client → server | Subscribe / unsubscribe from a lot |
| `bid:new` | server → client | Broadcast new high bid (price, count, bidder) |
| `auction:closed` | server → client | Auction has ended |

---

## Design System

A custom token-driven system ("Technical Precision") — a Swiss-bank-meets-auction-house aesthetic.

- **Palette** — Deep Midnight (`#012C4E`) structure · Vibrant Gold (`#FFD45F`) prestige accents · high-key neutral surfaces · semantic success/warning/error/info tokens
- **Typography** — Geist (display) · Inter (body) · JetBrains Mono (data & metadata)
- **Spacing** — strict 8px grid
- **Components** — buttons (4 variants + disabled/loading), inputs (focus/error), cards, modal, tabs, status pills, toasts, pagination, tooltip, skeleton shimmer
- **Motion** — scroll-triggered reveals, count-up infographics, micro-interactions; fully honors `prefers-reduced-motion`

See [`DESIGN.md`](DESIGN.md) for the full token reference.

---

## Project Structure

```
FSD - Auction System/
├── api/                              # Backend — Express + Prisma + Socket.io
│   ├── prisma/
│   │   ├── schema.prisma             # User · Auction · Bid · Watchlist
│   │   ├── seed.js                   # Demo seller + bidders + 12 live auctions
│   │   └── makeAdmin.js              # Bootstrap / promote an admin
│   └── src/
│       ├── index.js                  # Server entry — Express + Socket.io + cron
│       ├── lib/prisma.js             # Prisma client (pg adapter, pool max 3)
│       ├── middleware/auth.js        # requireAuth + requireAdmin
│       ├── routes/                   # auth · auctions · bids · admin · watchlist
│       └── jobs/auctionCloser.js     # Cron — closes expired auctions
│
├── client/                           # Frontend — React + Vite
│   ├── public/images/                # Catalog & UI imagery
│   └── src/
│       ├── config.js                 # API_BASE (env-driven)
│       ├── lib/api.js                # Axios instance w/ JWT interceptor + 401 logout
│       ├── context/                  # AuthContext · ToastContext
│       ├── hooks/                    # useCountUp
│       ├── components/               # Navbar · Footer · AuctionCard · CountdownTimer
│       │                             #   · Spinner · StatsBand · Reveal · Pagination · Tooltip
│       ├── assets/css/               # styles.css · animations.css
│       └── pages/                    # Home · Browse · ProductDetails · Dashboard ·
│                                     #   Sell · Watchlist · Checkout · AdminDashboard ·
│                                     #   Login · Register · NotFound
│
├── DESIGN.md                         # Design system & tokens
├── context.md                        # Development log
└── README.md
```

---

## Verification & Test Results

Validated against the live Neon database:

| Check | Result |
|---|---|
| Client production build | ✅ Clean (Vite, ~135 KB gzip JS) |
| Backend module load + Prisma schema | ✅ Valid |
| `POST /auth/register` issues JWT with `role` claim | ✅ |
| Admin routes gated | ✅ `401` (no token) · `403` (non-admin) |
| Place valid bid (`$100 → $150`) | ✅ `201`, row-lock validation enforced |
| Reject low / unauthenticated bid | ✅ `400` / `401` |
| Cron auction-closer | ✅ Expired auctions auto-transition `ACTIVE → CLOSED` |
| Real-time `bid:new` broadcast | ✅ Verified end-to-end across a subscribed client |

---

## Roadmap

- [ ] Transactional emails (outbid / won) via Resend
- [ ] Bid rate-limiting via Upstash Redis
- [ ] Cloudinary signed uploads + provenance-document attachments
- [ ] Cultural-property / compliance review workflow
- [ ] Proxy ("max") bidding
- [ ] Complete migration of remaining inline styles onto design-system classes
- [ ] Mobile breakpoint pass (320–414px) + WCAG AA contrast audit
- [ ] Production deployment — Render (API) · Vercel (client) · Neon (DB)

---

## Author

**Yogesh Kamisetty** — [GitHub](https://github.com/yogeshkamisetty)

> Built as a full-stack engineering project demonstrating real-time systems, transactional integrity, role-based access control, and design-system discipline.

---

<div align="center">
<sub>Golden Hammer Auctions — real-time full-stack auction marketplace on the PERN + Socket.io stack.</sub>
</div>
