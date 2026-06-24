# Golden Hammer Auctions — Project Context

> **Last Updated**: 24 June 2026  
> **Audit Phase**: Production-Readiness Assessment (Phases 1–18)

---

## 1. Overview

Golden Hammer Auctions is a full-stack, real-time bidding platform designed for high-stakes asset liquidation. Users register as collectors, list items for consignment, browse active auction catalogs, track watched lots, and place competitive bids synchronized via WebSockets.

The application follows the **Technical Precision 2.0** design system — balancing Deep Midnight Blue structural elements, light grey canvas backgrounds, and Vibrant Gold accent triggers for a prestigious, Swiss-bank-inspired aesthetic.

### Business Goals
- Provide a premium auction experience competitive with Sotheby's and Christie's digital platforms
- Enable real-time competitive bidding with low-latency WebSocket synchronization
- Support buyer/seller/admin workflows with role-based access
- Generate revenue via buyer's premium (5%) and seller's commission (10%)

### User Roles
| Role | Capabilities |
|------|-------------|
| **Visitor** | Browse catalog, view auction details, register |
| **Collector (USER)** | All visitor + bid, watchlist, consign assets, dashboard, checkout |
| **Administrator (ADMIN)** | All collector + manage users, verify auctions, view analytics, suspend accounts, manage listings |

---

## 2. Technology Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 (Vite 8) |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios with JWT interceptor |
| **Server State** | @tanstack/react-query (React Query) |
| **Real-time** | socket.io-client |
| **Styling** | Vanilla CSS (8px grid token system) |
| **Typography** | Geist (headlines), Inter (body), JetBrains Mono (metadata) |
| **Icons** | Material Symbols Outlined (Google Fonts) |

### Backend
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js + Express 5.2 |
| **ORM** | Prisma 7.8 with `@prisma/adapter-pg` |
| **Database** | PostgreSQL (Neon Serverless) |
| **Real-time** | Socket.io (server) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Image Storage** | Cloudinary (direct URL uploads) |
| **Email** | Resend API (with dev console fallback) |
| **Rate Limiting** | Custom (Upstash Redis / in-memory fallback) |
| **Security** | Helmet (CSP disabled), CORS |
| **Scheduling** | node-cron (auction closer, purge jobs) |
| **Deployment** | Render.com (render.yaml) |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT (Vite/React)                 │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐  │
│  │ Pages   │ │Components│ │  Context   │ │  Hooks    │  │
│  │ (11)    │ │  (14)    │ │Auth, Toast │ │useCountUp │  │
│  └────┬────┘ └────┬─────┘ └─────┬──────┘ └───────────┘  │
│       │           │             │                        │
│       └───────────┴─────────────┘                        │
│                    │                                     │
│           ┌────────┴────────┐                            │
│           │  lib/api.js     │  Axios + JWT interceptor   │
│           │  config.js      │  API_URL                   │
│           └────────┬────────┘                            │
└────────────────────┼─────────────────────────────────────┘
                     │ HTTP + Socket.io
┌────────────────────┼─────────────────────────────────────┐
│                    ▼  API (Express)                       │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Middleware: auth.js, rateLimit.js, helmet, cors  │    │
│  └───────┬──────────────────────────────────────────┘    │
│          │                                               │
│  ┌───────┴───────────────────────────────────────┐       │
│  │  Routes: auth, auctions, bids, watchlist, admin│       │
│  └───────┬───────────────────────────────────────┘       │
│          │                                               │
│  ┌───────┴───────────┐  ┌─────────────────────────┐     │
│  │  Prisma ORM       │  │  Jobs: auctionCloser,   │     │
│  │  (PG adapter)     │  │  purgeDeletedAuctions   │     │
│  └───────┬───────────┘  └─────────────────────────┘     │
│          │                                               │
│  ┌───────┴───────────┐  ┌──────────┐ ┌──────────┐      │
│  │  PostgreSQL       │  │Cloudinary│ │ Resend   │      │
│  │  (Neon Serverless)│  │ (images) │ │ (emails) │      │
│  └───────────────────┘  └──────────┘ └──────────┘      │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure

```
d:/Yogesh/Coding/FSD - Auction System/
├── api/                              # Backend Express Server
│   ├── prisma/
│   │   ├── schema.prisma             # Models: User, Auction, Bid, Watchlist
│   │   ├── seed.js                   # Demo data seeder (12 auctions)
│   │   ├── makeAdmin.js              # CLI admin promotion utility
│   │   └── prisma.config.ts          # Prisma configuration
│   ├── src/
│   │   ├── index.js                  # Express + Socket.io entrypoint
│   │   ├── routes/
│   │   │   ├── auth.js               # Register, login, /me, profile update
│   │   │   ├── auctions.js           # CRUD auctions, settlement, image upload
│   │   │   ├── bids.js               # Place bids (SELECT FOR UPDATE), bid history
│   │   │   ├── admin.js              # Admin dashboard, user/auction management
│   │   │   └── watchlist.js          # Watchlist add/remove/list
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification + admin guard
│   │   │   └── rateLimit.js          # Rate limiting (Redis/in-memory)
│   │   ├── jobs/
│   │   │   ├── auctionCloser.js      # Cron: close expired auctions + email winners
│   │   │   └── purgeDeletedAuctions.js # Cron: hard-delete after 7 days
│   │   └── lib/
│   │       ├── prisma.js             # Prisma client singleton
│   │       ├── email.js              # Resend email wrapper
│   │       └── socket.js             # ⚠️ DEAD CODE — not imported anywhere
│   ├── .env                          # Environment variables
│   ├── render.yaml                   # Render.com deployment config
│   └── package.json                  # Dependencies
│
├── client/                           # Frontend React Application (Vite 8)
│   ├── public/
│   │   └── images/                   # Static product and UI images
│   ├── src/
│   │   ├── main.jsx                  # Application entry (React 19)
│   │   ├── App.jsx                   # Router with protected routes
│   │   ├── config.js                 # API_URL configuration
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing hero + featured auctions (26KB)
│   │   │   ├── Browse.jsx            # Catalog with URL-synced filters (12KB)
│   │   │   ├── ProductDetails.jsx    # Real-time bidding + Socket.io (22KB)
│   │   │   ├── Dashboard.jsx         # Buyer/seller workspace (34KB)
│   │   │   ├── AdminDashboard.jsx    # Administration panel (46KB)
│   │   │   ├── Checkout.jsx          # Settlement + buyer premium (13KB)
│   │   │   ├── Watchlist.jsx         # Portfolio monitor + activity feed (14KB)
│   │   │   ├── Sell.jsx              # Consignment form + Cloudinary (13KB)
│   │   │   ├── Login.jsx             # Authentication portal (4KB)
│   │   │   ├── Register.jsx          # Collector onboarding (7KB)
│   │   │   └── NotFound.jsx          # 404 page (1KB)
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Role-based nav + mobile drawer (10KB)
│   │   │   ├── Footer.jsx            # Deep Midnight footer
│   │   │   ├── AuctionCard.jsx       # Lot cards with hover effects
│   │   │   ├── CountdownTimer.jsx    # Live countdown display
│   │   │   ├── ErrorBoundary.jsx     # React error boundary
│   │   │   ├── Spinner.jsx           # Loading spinner
│   │   │   ├── StatsBand.jsx         # Animated KPI infographic
│   │   │   ├── Reveal.jsx            # Scroll-reveal observer wrapper
│   │   │   ├── Pagination.jsx        # Windowed page navigation
│   │   │   ├── Tooltip.jsx           # Accessible CSS tooltip
│   │   │   ├── ProtectedRoute.jsx    # Auth-gated route wrapper
│   │   │   ├── AdminRoute.jsx        # Admin-gated route wrapper
│   │   │   ├── SkeletonCard.jsx      # Card loading skeleton
│   │   │   └── SkeletonDetails.jsx   # Detail page loading skeleton
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # JWT auth state + session validation
│   │   │   └── ToastContext.jsx      # Non-blocking toast notifications
│   │   ├── hooks/
│   │   │   └── useCountUp.js         # Eased number animation for stats
│   │   ├── lib/
│   │   │   └── api.js                # Axios instance with JWT interceptor
│   │   └── assets/css/
│   │       ├── styles.css            # Technical Precision 2.0 design system (~3200 lines)
│   │       ├── animations.css        # Motion & transition keyframes
│   │       └── homepage-dark.css     # Dark-themed homepage overrides
│   ├── vite.config.js                # Vite bundler configuration
│   └── package.json                  # Client dependencies
│
├── DESIGN.md                         # Technical Precision 2.0 style guide
├── DEPLOY.md                         # Deployment instructions
├── README.md                         # Project documentation
└── context.md                        # This file
```

---

## 5. Database Schema

### Models

**User**
- `id`, `email` (unique), `password` (hashed), `name`, `role` (USER/ADMIN)
- `verificationStatus` (UNVERIFIED/PENDING/VERIFIED)
- `suspended` (boolean), `createdAt`

**Auction**
- `id`, `title`, `description`, `imageUrl`, `startingPrice`, `currentBid`, `bidCount`
- `status` (PENDING/ACTIVE/CLOSING/CLOSED/SETTLED)
- `verificationStatus` (UNVERIFIED/PENDING/VERIFIED)
- `category`, `featured`, `endTime`, `createdAt`, `deletedAt` (soft delete)
- Relations: `seller` → User, `bids` → Bid[], `watchers` → Watchlist[]

**Bid**
- `id`, `amount`, `createdAt`
- Relations: `bidder` → User, `auction` → Auction

**Watchlist**
- `id`, `createdAt`
- Relations: `user` → User, `auction` → Auction
- Unique constraint: `[userId, auctionId]`
- Cascade delete on auction deletion

### Enums
- `AuctionStatus`: PENDING, ACTIVE, CLOSING, CLOSED, SETTLED
- `VerificationStatus`: UNVERIFIED, PENDING, VERIFIED
- `Role`: USER, ADMIN

### Database Indexes
- `Auction`: `[status, featured]`, `[sellerId]`, `[verificationStatus]`, `[deletedAt]`
- `Bid`: `[auctionId, amount(desc)]`

---

## 6. API Routes

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account (rate limited) |
| POST | `/login` | — | JWT login (rate limited) |
| GET | `/me` | JWT | Get current user profile |
| PATCH | `/profile` | JWT | Update profile (name, email) |

### Auctions (`/api/auctions`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List active, non-deleted auctions (**⚠️ no pagination**) |
| GET | `/:id` | — | Get auction details with bids |
| POST | `/` | JWT | Create auction (rate limited, validated) |
| DELETE | `/:id` | JWT | Soft-delete own auction |
| PATCH | `/:id/settle` | JWT | Settle as winner |

### Bids (`/api/bids`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/:auctionId` | JWT | Place bid (transactional, SELECT FOR UPDATE) |
| GET | `/my` | JWT | Get user's bid history |

### Watchlist (`/api/watchlist`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | Get user's watchlist |
| POST | `/:auctionId` | JWT | Add to watchlist |
| DELETE | `/:auctionId` | JWT | Remove from watchlist |

### Admin (`/api/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard` | Admin | Platform statistics |
| GET | `/users` | Admin | All users |
| PATCH | `/users/:id/role` | Admin | Change user role |
| PATCH | `/users/:id/suspend` | Admin | Suspend/unsuspend |
| GET | `/auctions` | Admin | All auctions (including soft-deleted) |
| PATCH | `/auctions/:id` | Admin | Update auction (verify, feature, change status) |
| DELETE | `/auctions/:id` | Admin | Hard-delete auction |
| GET | `/auctions/deleted` | Admin | **⚠️ UNREACHABLE — route order bug** |

### Socket.io Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join:auction` | Client → Server | Join auction room for real-time updates |
| `bid:new` | Server → Room | Broadcast new bid to auction room |
| `auction:closed` | Server → Room | Broadcast auction closure |

---

## 7. Core User Workflows

### Buyer Journey
1. Register → Browse catalog → View auction details
2. Place bid (real-time via Socket.io) → Monitor in watchlist
3. Win auction → Checkout with buyer premium (5%) → Settle

### Seller Journey
1. Register → Upload item with Cloudinary image → Submit for consignment
2. Admin verifies listing → Auction goes ACTIVE
3. Auction closes → Winner settles → Seller receives (amount - 10% commission)

### Admin Journey
1. Login with admin role → Access admin dashboard
2. Verify/reject new listings → Manage users (suspend, role changes)
3. Feature auctions → Monitor platform statistics

---

## 8. Work Completed (Chronological)

### Phase 0 — Foundation (Initial Build)
1. **React Migration**: Ported from vanilla HTML/CSS/JS to React (Vite)
2. **Auth System**: JWT-based AuthContext with Axios interceptor
3. **Core Pages**: Home, Browse, ProductDetails, Dashboard, AdminDashboard, Login, Register
4. **Real-time Bidding**: Socket.io integration for live bid updates
5. **Cloudinary Integration**: Direct image upload for consignment listings

### Phase 1 — Design System ("Technical Precision 2.0")
1. **Color Token System**: Strict 60-30-10 distribution (Surface/Midnight/Gold)
2. **Typography**: Geist, Inter, JetBrains Mono font stack
3. **8px Grid**: Consistent spacing tokens and layout utilities
4. **Material Symbols**: Icon font integration replacing literal text
5. **Component Library**: Buttons, inputs, status pills, skeleton loaders

### Phase 2 — Feature Additions
1. **Watchlist**: Portfolio monitoring with real-time activity feed
2. **Checkout**: Settlement flow with server-derived buyer premium
3. **StatsBand**: Animated KPI infographic on homepage
4. **Scroll Reveals**: IntersectionObserver-powered entrance animations
5. **Pagination**: Windowed page numbers for admin tables
6. **Toast System**: Non-blocking notifications replacing all `alert()` calls

### Phase 3 — Design Audit & Remediation (Score: 42 → ~72/100)
1. **Icon Font Fix**: Material Symbols was used but never imported
2. **Button/Input States**: Added `:disabled`, `.is-loading`, `.is-error` states
3. **Color Unification**: Purged 13 hardcoded hex values from JSX
4. **Token Gaps**: Added `--warning`, `--info`, `--on-success` semantic tokens
5. **Tooltip Component**: Accessible CSS tooltip with `aria-describedby`
6. **Layout Utilities**: `.stack`, `.row`, `.cluster`, `.gap-*`, `.text-muted`

### Phase 4 — Production Hardening (24 June 2026)
1. **Protected Routes**: `/dashboard`, `/sell`, `/watchlist`, `/checkout/:id` guarded
2. **Session Validation**: `/me` endpoint validates JWT on app startup
3. **Checkout Integrity**: Server-derived settlement amounts replace client calculations
4. **Upload Enforcement**: Failed Cloudinary uploads block publication (no silent fallbacks)
5. **Navigation Honesty**: Removed non-functional search/notification/dark-mode decorations
6. **Filter URL Sync**: Browse page filters synchronized with URL parameters
7. **Admin Modals**: Accessible confirmation dialogs with focus trapping
8. **Dynamic Watchlist**: Real data replaces mock "Live Market Feed"
9. **Currency Localization**: All `toLocaleString()` pinned to `'en-US'`
10. **Rate Limiting**: Modular rate limiter for auth and listing endpoints
11. **Input Validation**: Price validation, Cloudinary URL sanitization on auction creation
12. **Role-Based Navigation**: Dynamic nav links + intelligent nested-route highlighting

### Phase 5 — Premium Consignment Registry Redesign (24 June 2026)
1. **Sell Page Wizard**: Redesigned Sell.jsx into a dark-themed, 3-step wizard (Asset Details → Provenance & Media → Valuation & Publish).
2. **Live Preview**: Added real-time auction card preview that updates as the user fills out the form.
3. **Golden Shimmer Button**: Built an animated, premium gold publish button.
4. **CSS Upgrades**: Added ~745 lines of CSS to `styles.css` matching the dark luxury homepage aesthetic without introducing new color tokens.

---

## 9. Production-Readiness Audit

### 🔴 CRITICAL Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | **JWT expiry of 365 days** with no refresh/revocation mechanism | `api/.env`, `auth.js` | Stolen token = year-long access |
| C2 | **Admin role read from JWT payload**, not from DB on each request | `middleware/auth.js` | Demoted admins retain access until token expires |
| C3 | **Socket.io has zero authentication** — any connection can join any room | `api/src/index.js` | Unauthenticated users can monitor all bid activity |
| C4 | **No `express.json()` size limit** — default accepts unlimited payload | `api/src/index.js` | DoS via 100MB+ JSON body |
| C5 | **CORS defaults to `*`** if `CORS_ORIGIN` env is not set | `api/src/index.js` | Any origin can make authenticated requests |
| C6 | **No test framework installed** — zero unit, integration, or e2e tests | `api/package.json` | Zero confidence in regression safety |

### 🟠 HIGH Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| H1 | **Seller can bid on own auction** (shill bidding) | `api/src/routes/bids.js` | Auction integrity compromise |
| H2 | **No email format validation** on registration | `api/src/routes/auth.js` | Invalid accounts created |
| H3 | **No pagination on public auction list** | `api/src/routes/auctions.js` | OOM/timeout with thousands of listings |
| H4 | **Admin route ordering bug** — `/auctions/deleted` unreachable | `api/src/routes/admin.js` | Dead endpoint, no soft-delete recovery for admins |
| H5 | **XSS via auction title in email templates** | `api/src/jobs/auctionCloser.js` | Stored XSS in winner/seller notification emails |
| H6 | **Auction deletion doesn't check status** — active auctions with bids can be deleted | `api/src/routes/auctions.js` | Bidders lose bids with no notification |
| H7 | **In-memory rate limiter Map grows unbounded** | `api/src/middleware/rateLimit.js` | Memory leak in production |
| H8 | **Settlement race condition** — no transaction on status check + update | `api/src/routes/auctions.js` | Double-settlement possible |
| H9 | **Auction closer race condition** — no transaction wrapping loop | `api/src/jobs/auctionCloser.js` | Duplicate closure/emails in clustered deploys |
| H10 | **No `updatedAt` field on any model** | `prisma/schema.prisma` | No audit trail for record modifications |

### 🟡 MEDIUM Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| M1 | **Floating-point arithmetic for financial calculations** (`parseFloat`) | Multiple routes | Rounding errors on commissions/premiums |
| M2 | **Helmet CSP explicitly disabled** | `api/src/index.js` | No Content-Security-Policy protection |
| M3 | **No structured logging** (only `console.log/error`) | All backend files | No log aggregation, correlation, or alerting |
| M4 | **No graceful shutdown** (SIGTERM/SIGINT handlers) | `api/src/index.js` | Open connections dropped on deploy |
| M5 | **Health check doesn't verify DB connectivity** | `api/src/index.js` | `/health` says OK even if DB is down |
| M6 | **Dead code: `src/lib/socket.js`** never imported | `api/src/lib/socket.js` | Confusion, maintenance burden |
| M7 | **No API versioning** — all routes under `/api/` | All routes | Breaking changes affect all clients |
| M8 | **~330 inline `style={{}}` objects remain** in JSX | Multiple pages | Design system bypass, maintenance debt |
| M9 | **Database connection pool capped at 3** with no health monitoring | `api/src/lib/prisma.js` | Pool exhaustion under load |
| M10 | **Seed script Unsplash URLs conflict with Cloudinary validation** | `prisma/seed.js` | Seeded data fails creation endpoint validation |

### 🟢 LOW / Enhancement Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| L1 | No password reset / forgot-password flow | Backend | Users locked out permanently |
| L2 | No email verification on registration | Backend | Unverified accounts active immediately |
| L3 | No logout endpoint / token invalidation | Backend | Tokens live forever once issued |
| L4 | No OpenAPI / Swagger documentation | Backend | No API contract documentation |
| L5 | No audit trail for admin actions | Backend | No accountability for admin operations |
| L6 | No payment / escrow integration | Backend | Settlement is just a status flip |
| L7 | Mixed line endings (CRLF/LF) across files | All files | Git diff noise, inconsistency |
| L8 | No `.editorconfig` | Project root | No cross-editor formatting agreement |
| L9 | No route-level code splitting (`React.lazy`) | Frontend | Single large bundle |
| L10 | Mobile breakpoints below 720px need work | Frontend CSS | Small device UX degradation |

---

## 10. Remediation Priority Roadmap

### 🔥 Tier 1 — Ship Blockers (Must Fix Before Production)

1. **Reduce JWT expiry to 24h**, add refresh token rotation
2. **Read user role from DB** in `requireAuth` middleware, not JWT
3. **Add Socket.io JWT authentication** on connection handshake
4. **Add `express.json({ limit: '1mb' })`** body size limit
5. **Set explicit CORS origin** (remove `*` fallback)
6. **Fix admin route ordering** — move `/auctions/deleted` before `/:id`
7. **Block seller self-bidding** — check `userId !== sellerId`
8. **Add pagination** to public auction listing
9. **Sanitize HTML in email templates** to prevent stored XSS
10. **Wrap settlement in a transaction** to prevent race condition

### 🔧 Tier 2 — High-Priority Hardening

11. Add email format validation (Zod/express-validator)
12. Add `updatedAt @updatedAt` to all Prisma models
13. Add graceful shutdown handlers (SIGTERM/SIGINT)
14. Replace `parseFloat` with `Decimal.js` for financial math
15. Enable Helmet CSP
16. Add structured logging (pino/winston)
17. Add health check DB ping
18. Prune in-memory rate limiter entries (TTL cleanup)
19. Protect auction deletion (block if status=ACTIVE with bids)
20. Transaction-wrap auction closer cron job

### 🧹 Tier 3 — Quality & Maintainability

21. Install and configure Vitest for unit testing
22. Migrate remaining ~330 inline styles to CSS classes
23. Add `.editorconfig` and normalize line endings
24. Delete dead `src/lib/socket.js`
25. Add API versioning prefix (`/api/v1/`)
26. Add route-level code splitting (`React.lazy`)
27. Add OpenAPI documentation
28. Add admin action audit logging
29. Add Sentry/error tracking integration

### 🌟 Tier 4 — Feature Completeness

30. Password reset flow (forgot-password + email token)
31. Email verification on registration
32. Logout endpoint with token blacklist
33. Payment/escrow provider integration
34. KYC and provenance verification
35. Signed Cloudinary uploads (server-side)

---

## 11. Issues Faced & Resolutions (Historical)

1. **Low-contrast focus rings**: Fixed with white/gold outlines on dark panels (WCAG AA)
2. **Mobile table overflow**: Tables wrapped in `.table-scroll-container`
3. **Countdown badge nesting**: `CountdownTimer.jsx` returns plain text fragments
4. **WebSocket/Socket.io mismatch**: Frontend switched from native `WebSocket` to `socket.io-client`
5. **Bid SQL syntax errors**: Corrected snake_case to camelCase column quotes in `SELECT FOR UPDATE`
6. **Stale Prisma client**: Regenerated after schema migration added `deletedAt`
7. **Git safe-directory restriction**: Per-command `safe.directory` override
8. **Vite `spawn EPERM` in sandbox**: Rerun with execution permission
9. **Browser automation failures**: Recorded as pending manual QA

---

## 12. Superseded Context

> The following earlier statements are no longer accurate:

- ~~Checkout uses a client-side 15% buyer premium, local tax, and shipping calculator.~~ → Checkout now consumes the backend settlement summary (5% buyer premium).
- ~~Seller image uploads use category-based fallback images.~~ → Upload failures now block publication.
- ~~Backend uses SQLite.~~ → PostgreSQL via Prisma + `@prisma/adapter-pg` (Neon Serverless).
- ~~Frontend uses native WebSockets.~~ → Uses `socket.io-client` matching the backend.
- ~~Navigation is static.~~ → Navigation is role-based with intelligent nested-route highlighting.
- ~~`StatsBand` displays real platform metrics.~~ → Explicitly labeled as illustrative demonstration figures.

---

## 13. Key File Reference

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `client/src/assets/css/styles.css` | Design system tokens, components, utilities | Adding UI styles or color variables |
| `client/src/pages/ProductDetails.jsx` | Real-time bidding + Socket.io integration | WebSocket events, bid flow changes |
| `client/src/pages/Checkout.jsx` | Settlement with server-derived financial summary | Payment flow, premium calculations |
| `client/src/pages/AdminDashboard.jsx` | Full admin panel (46KB, largest file) | Admin feature changes |
| `client/src/components/Navbar.jsx` | Role-based navigation + active highlights | Navigation structure changes |
| `client/src/context/AuthContext.jsx` | JWT session management + validation | Auth flow changes |
| `api/src/routes/bids.js` | Transactional bidding with SELECT FOR UPDATE | Bid logic or concurrency changes |
| `api/src/routes/auctions.js` | Auction CRUD + settlement | Auction lifecycle changes |
| `api/src/middleware/auth.js` | JWT verification + admin guard | Security changes |
| `api/src/jobs/auctionCloser.js` | Cron: close expired auctions + notify | Auction lifecycle automation |
| `prisma/schema.prisma` | Database models and indexes | Schema changes |
| `DESIGN.md` | Technical Precision 2.0 style guide | UI design decisions |

---

## 14. Environment Variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Neon Serverless |
| `JWT_SECRET` | Token signing secret | **⚠️ Must be rotated if ever committed** |
| `JWT_EXPIRES_IN` | Token lifetime | Currently `365d` — **should be `24h`** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | Image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary key | |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | |
| `RESEND_API_KEY` | Resend email service | |
| `CORS_ORIGIN` | Allowed CORS origin | **Falls back to `*` if unset** |
| `PORT` | Server port | Default: 3001 |
| `UPSTASH_REDIS_REST_URL` | Redis for rate limiting | Optional, falls back to in-memory |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | |

---

## 15. Verification Status

| Check | Result | Date |
|-------|--------|------|
| `client: npm run lint` | ✅ Pass | 24 June 2026 |
| `client: npm run build` | ✅ Pass (180 modules) | 24 June 2026 |
| `api: node --check` all routes | ✅ Pass | 24 June 2026 |
| Frontend dev server (`127.0.0.1:5173`) | ✅ HTTP 200 | 24 June 2026 |
| API dev server (`127.0.0.1:3001/api/auctions`) | ✅ HTTP 200 | 24 June 2026 |
| Git whitespace check | ✅ Pass | 24 June 2026 |
| Interactive browser QA | ⏳ Pending | — |
| Unit/integration tests | ❌ None exist | — |
| Security penetration test | ❌ Not performed | — |
| Accessibility audit (Lighthouse/axe) | ❌ Not performed | — |
| Load testing | ❌ Not performed | — |
