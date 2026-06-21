# Golden Hammer Auctions - Project Context

## Overview
Golden Hammer Auctions is a full-stack, real-time bidding application designed to mimic a professional, high-stakes auction house experience. Users can register, list items for consignment, browse active catalog logs, track watched lots in real-time, and place bids under WebSocket synchronization. 

The application is built on the **Technical Precision 2.0** design guidelines—balancing Deep Midnight Blue structures, light grey canvas backgrounds, and Vibrant Gold accent triggers for a prestigious, Swiss-bank-inspired digital catalog.

## Technologies Used
- **Frontend Core**: React (Vite), React Router DOM, Axios, @tanstack/react-query (React Query)
- **Styling**: Custom CSS (Vanilla stylesheets structured on an 8px grid token scale)
- **Backend Node.js Server**: Express.js, Prisma ORM, SQLite
- **Real-time Synchronization**: Native WebSockets (`ws://`)
- **Asset Storage & Uploads**: Cloudinary API Integration
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

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
│   │   └── index.js            # Main server entry point (WebSocket setup)
│   └── .env                    # Backend environment variables
│
├── client/                     # Frontend React Application (Vite)
│   ├── public/                 # Static assets
│   │   └── images/             # Product and UI images
│   ├── src/                    # Frontend source code
│   │   ├── assets/             # Global CSS styles
│   │   │   ├── css/styles.css  # Technical Precision 2.0 stylesheet
│   │   │   └── css/animations.css # Motion & visualization styles (reveals, transitions)
│   │   ├── components/         # Reusable React components
│   │   │   ├── Navbar.jsx      # Navigation header with mobile drawer menu
│   │   │   ├── Footer.jsx      # Structural Deep Midnight footer
│   │   │   ├── AuctionCard.jsx # High-contrast lot cards with hover scales
│   │   │   ├── CountdownTimer.jsx # Live time display component
│   │   │   ├── Spinner.jsx     # Glass loading spinners
│   │   │   ├── StatsBand.jsx   # Animated KPI infographic component
│   │   │   └── Reveal.jsx      # Scroll-reveal intersection observer wrapper
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useCountUp.js   # Eased number counter for stats band
│   │   ├── context/            # React Contexts (AuthContext for JWT handling)
│   │   ├── lib/                # API communication layers
│   │   │   └── api.js          # Axios interceptor setups
│   │   ├── pages/              # React route components
│   │   │   ├── Home.jsx        # Landing hero with Q3 Volume statistics
│   │   │   ├── Browse.jsx      # Catalog lists with sidebar filters
│   │   │   ├── ProductDetails.jsx # WS ledger and pulse auction details
│   │   │   ├── Dashboard.jsx   # Workspace for Buyers/Sellers
│   │   │   ├── AdminDashboard.jsx # Administration command board
│   │   │   ├── Checkout.jsx    # Invoice checkout and courier tracking
│   │   │   ├── Watchlist.jsx   # Portfolio monitor and market ticker
│   │   │   ├── Sell.jsx        # Consignment creation forms
│   │   │   ├── Login.jsx       # Portal authentication
│   │   │   └── Register.jsx    # Collector onboarding forms
│   │   ├── App.jsx             # Router endpoints
│   │   └── main.jsx            # Application entry point
│   ├── package.json            # Client packages and build scripts
│   └── vite.config.js          # Bundling settings
│
├── DESIGN.md                   # Style guide, typography, and color tokens
└── context.md                  # This context file
```

## What We Have Done

1. **Initial Migration**:
   - Ported the Vanilla HTML/CSS/JS frontend into a modern React (Vite) template.
   - Set up an `AuthContext` to centralize token headers in an Axios interceptor.

2. **Stitch Design Integration**:
   - Added new routes `/watchlist` and `/checkout/:id`.
   - Created the Checkout page supporting 15% Buyer's Premium calculators, local tax rates, Insured White Glove Courier Delivery steps, and secure Escrow settlement.
   - Built the Watchlist control center listing monitored lots, portfolio valuations, and real-time market activity feed timelines.

3. **Technical Precision 2.0 Style Overhaul**:
   - Defined strict color tokens (`--surface`, `--secondary` for Midnight Blue, and `--primary-container` for Gold) matching [DESIGN.md](file:///d:/Yogesh/Coding/FSD%20-%20Auction%20System/DESIGN.md).
   - Enforced Inter, Geist (with tight display tracking), and JetBrains Mono monospace typography pairings.
   - Removed muddy shadows and replaced them with `1px solid var(--outline-variant)` structural borders.

4. **Design Audit & Polishing Refinements**:
   - **Interactive Hamburger Nav Menu**: Overhauled the navbar to include responsive navigation panel dropdowns with clean ARIA tags.
   - **Keyboard Focus Contrast**: Refactored focus rings to use high-contrast golden outlines on dark panels (headers/footers) to comply with WCAG AA.
   - **Mobile Scroll Safety**: Wrapped all tables in `.table-scroll-container` wrappers to avoid viewports stretching horizontally.
   - **Appraiser Modal Spring Transitions**: Added hardware-accelerated cubic-bezier fade-in and scale-in transforms for appraisal modals.
   - **WebSocket announcements**: Connected inputs to labels and assigned `aria-live="polite"` to WebSocket bid feeds.
   - **Image Upload Integration**: Integrated Cloudinary API direct uploads in `Sell.jsx` with category fallbacks.

5. **Visual Overhaul & Interactive Motion Design**:
   - **High-end Visualizations & Cohesive Color Palette**: Strengthened visual alignment with the "Technical Precision 2.0" Swiss-bank aesthetic, using crisp high-contrast border grids (`var(--outline-variant)`).
   - **StatsBand KPI Infographic**: Implemented a modern gridded glassmorphism dashboard overlay in the Home page containing animated KPI elements (Clearance Rate, Latency, Volume).
   - **Scroll-Triggered Reveals & Stagger Effects**: Developed custom `<Reveal>` wrapper triggering viewport scroll-animations.
   - **Micro-Interactions**: Wired card lifts, image hover zoom, button sheen sweeps, and brushed-metal skeleton shimmers.
   - **Demo & Products Refresh**: Redesigned `seed.js` to build 12 live active auctions with future closing times, authentic bid history arrays, and multi-user configurations.
   - **Official Logo Integration**: Replaced placeholder vector outlines in `Navbar.jsx` with the official custom `logo2.png` graphics paired with polished, display-spaced typography.

## Issues Faced & Resolutions

1. **Accessibility and Contrast Compliances**:
   - *Issue*: Low outline focus contrasts on Midnight background panels failed auditor scans.
   - *Resolution*: Defined target focus selectors specifying white/gold outlines strictly on dark layouts.
2. **Mobile Overflows**:
   - *Issue*: Metric tables in the admin audit lists and bidder ledgers forced viewports wider than 375px.
   - *Resolution*: Wrapped tables in overflow scroll boxes to safely constraint layouts.
3. **Double Badge Nesting**:
   - *Issue*: Countdown spans nested inside card spans resulted in duplicated badge layouts.
   - *Resolution*: Configured `CountdownTimer.jsx` to return plain text string fragments.
4. **WebSocket & Socket.io Integration**:
   - *Issue*: Real-time updates were broken because `ProductDetails.jsx` tried connecting to native `/ws` while the backend used Socket.io.
   - *Resolution*: Switched the frontend to use `socket.io-client` matching the backend rooms and event payloads.
5. **Bid Placement Collision & DB Error**:
   - *Issue*: Concurrent bid queries crashed with SQL syntax errors on snake_case columns.
   - *Resolution*: Corrected column quotes in the `SELECT ... FOR UPDATE` raw transaction script to use camelCase `"currentBid"` and `"endTime"` as generated by Prisma.

## Future Recommendations & Files to Reference

- **`client/src/assets/css/styles.css`**: Check this file to add new UI color variables or animations.
- **`client/src/pages/ProductDetails.jsx`**: Reference this file to examine WebSocket events or real-time ticker integrations.
- **`client/src/pages/Checkout.jsx`**: Reference this file to modify tax brackets, delivery steps, or escrow hooks.
- **PostgreSQL Migration**: The sqlite DB database fits local tests; migrate Prisma schemas to postgres for production scaling.
