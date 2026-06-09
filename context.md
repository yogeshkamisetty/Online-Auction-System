# Golden Hammer Auctions - Project Context

## Overview
Golden Hammer Auctions is a full-stack, real-time bidding application designed to mimic a professional auction house experience. Users can register, list their items for auction, browse and search through existing listings, and place real-time bids on items.

## Technologies Used
- **Frontend**: React (Vite), React Router DOM, Axios, Socket.io-client
- **Backend**: Node.js, Express.js
- **Database**: Prisma ORM with SQLite (can be migrated to PostgreSQL)
- **Real-time Communication**: Socket.io
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

## Folder Structure

```
d:/Yogesh/Coding/FSD - Auction System/
├── api/                        # Backend Node.js / Express Server
│   ├── prisma/                 # Prisma schema and SQLite database
│   │   └── schema.prisma       # Database models (User, Auction, Bid)
│   ├── src/                    # Backend source code
│   │   ├── controllers/        # Route controllers (auth, auctions, bids)
│   │   ├── middleware/         # Custom middleware (auth checking)
│   │   ├── routes/             # Express API routes
│   │   └── index.js            # Main server entry point (Socket.io config)
│   └── .env                    # Backend environment variables (JWT_SECRET)
│
├── client/                     # Frontend React Application (Vite)
│   ├── public/                 # Static assets
│   │   └── images/             # Product and UI images
│   ├── src/                    # Frontend source code
│   │   ├── assets/             # CSS styles
│   │   │   └── css/styles.css  # Global styling ported from Vanilla project
│   │   ├── components/         # Reusable React components (Navbar, Footer, AuctionCard)
│   │   ├── context/            # React Contexts (AuthContext for global state)
│   │   ├── pages/              # React route components (Home, Browse, Dashboard, etc.)
│   │   ├── App.jsx             # Main router configuration
│   │   └── main.jsx            # Application entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite bundler configuration
│
├── .gitignore                  # Git ignore rules
└── context.md                  # This file
```

## What We Have Done

1. **Initial Evaluation & Decisions**:
   - The user had an existing frontend written in Vanilla HTML/CSS/JS.
   - We determined that for a "professional, production-ready application", the frontend should be migrated to **React (Vite)** to ensure better maintainability, component reusability, and state management.

2. **Backend Security Enhancements**:
   - Generated a secure, 64-byte `JWT_SECRET` for the backend.
   - Extended the `JWT_EXPIRES_IN` to `365d` so users don't have to frequently re-authenticate.

3. **React Migration - Scaffolding**:
   - Initialized a new Vite React application in the `client/` directory.
   - Migrated the global styling `styles.css` and all `images/` to the React environment.
   - Configured `React Router` for declarative routing.

4. **React Migration - Core Implementation**:
   - Implemented an `AuthContext` to globally manage user login state and the JWT token.
   - Set up an `axios` interceptor inside `AuthContext` to automatically attach the `Authorization: Bearer <token>` header to all outgoing API requests.
   - Ported the shared `Navbar` and `Footer`. The `Navbar` automatically changes links (e.g., hiding "Log In" and showing "Log Out") based on the `AuthContext`.

5. **React Migration - Page Porting**:
   - **Home**: Replicated the landing page HTML to JSX.
   - **Login & Register**: Hooked up forms to `axios.post` endpoints with error handling.
   - **Browse**: Implemented client-side filtering for search terms, categories, and price ranges. Created reusable `AuctionCard` and `CountdownTimer` components.
   - **ProductDetails**: Fully integrated `Socket.io` client to listen for real-time `bid:new` and `auction:closed` events. The page instantly updates the current bid and adds to the bid history without refreshing.
   - **Dashboard**: Created conditional rendering for "Buyer" and "Seller" tabs, fetching data using the protected `/api/bids/my` and `/api/auctions` endpoints.
   - **Sell**: A protected route that allows authenticated users to create new auction listings.

## Issues Faced & Resolutions

1. **Authentication State Management**:
   - *Issue*: In Vanilla JS, the token and user data were manually retrieved from `localStorage` in every file, and requests manually appended the authorization header.
   - *Resolution*: Created `AuthContext.jsx` to centralize user state, and configured an `axios` interceptor. Now, importing `axios` directly handles authentication automatically.

2. **Socket.io Integration in React**:
   - *Issue*: Real-time updates required a persistent socket connection attached to the specific auction ID (`join:auction`).
   - *Resolution*: Initialized the `socket.io-client` inside a `useEffect` hook in `ProductDetails.jsx`, ensuring it connects and joins the room on mount, and gracefully `socket.disconnect()`s on unmount to prevent memory leaks. Updates correctly set React state so the UI rerenders automatically.

3. **Migrating Vanilla DOM Manipulation to React State**:
   - *Issue*: The old `scripts.js` heavily relied on `document.getElementById` and `innerHTML` to render tables and products.
   - *Resolution*: Refactored all data fetching into `useEffect` hooks and used JSX to declaratively map over arrays (`.map()`) for rendering tables and lists.

## Future Recommendations & Files to Reference

- **`client/src/pages/ProductDetails.jsx`**: Reference this file if you need to add more real-time features using Socket.io (e.g., chat, notifications).
- **`client/src/context/AuthContext.jsx`**: Reference this file if you add new authentication features like password resets or role-based access control (Admin vs User).
- **Image Uploads**: Currently, the `Sell.jsx` component leaves `imageUrl` empty. In the future, integrate a service like **Cloudinary** or **AWS S3**. You will need to modify the `/api/auctions` POST route and the frontend form to accept file uploads.
- **Database Scalability**: If the application grows, consider migrating the Prisma schema (`api/prisma/schema.prisma`) from SQLite to PostgreSQL.
