# Zero-Cost Production Deployment Guide

This guide describes how to deploy **Golden Hammer Auctions** to production for **$0/month** using free tiers that fit the project’s stack.

---

## 1. Zero-Cost Architecture Overview

```
┌─────────────────────────────────┐          ┌──────────────────────────────────┐
│   Vercel (Frontend - Free)      │          │    Render (Backend - Free Web)   │
│   - React SPA (Vite static)     │   REST   │    - Express + Socket.io Server  │
│   - Routing: vercel.json rewrite│◄────────►│    - Database: Prisma schema     │
│   - Speed: Global CDN edge      │  (JSON)  │    - Cron: node-cron (closes lots)│
└─────────────────────────────────┘          └────────────────┬─────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────┐          ┌──────────────────────────────────┐
│    cron-job.org (Free Pinger)   │  HTTP    │      Neon (Database - Free)      │
│   - Hits /health every 14 mins  │─────────►│    - Serverless PostgreSQL       │
│   - Prevents Render from sleeping│  GET     │    - ✅ Already Configured        │
└─────────────────────────────────┘          └──────────────────────────────────┘
```

---

## 2. Prerequisites
1. Push all files to a **GitHub repository** (Render and Vercel will build automatically from your commits).
2. Grab your Neon PostgreSQL connection string (which is already set in your local `api/.env`).

---

## 3. Step 1: Deploy Backend (Render Web Service)
Render's **Free Web Service** tier provides 750 free hours/month, which is enough to run 1 service continuously if kept awake.

### Option A: Automatic Setup (Blueprint)
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will read the `api/render.yaml` file automatically:
   * **Root Directory:** `api`
   * **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   * **Start Command:** `node src/index.js`
5. Supply the required Environment Variables when prompted (see below).

### Option B: Manual Setup
If you prefer not to use Blueprints:
1. Click **New** → **Web Service**.
2. Select your GitHub repository.
3. Configure the following:
   * **Name:** `golden-hammer-api`
   * **Language:** `Node`
   * **Root Directory:** `api`
   * **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   * **Start Command:** `node src/index.js`
   * **Instance Type:** `Free`

### Environment Variables to Set on Render:
* `DATABASE_URL`: `postgresql://...` (Neon Transaction/Pooled string)
* `DIRECT_URL`: `postgresql://...` (Neon Session/Direct string for migrations)
* `JWT_SECRET`: *Generate a strong secret key (e.g., `openssl rand -hex 64` or a long random character string)*
* `JWT_EXPIRES_IN`: `365d` (or `7d` if you prefer shorter sessions)
* `PORT`: `3001`
* `CORS_ORIGIN`: `https://your-app.vercel.app` *(Your Vercel URL once created. You can temporarily leave this as `*` and lock it down later).*

*Note: Copy your completed Web Service URL (e.g., `https://golden-hammer-api.onrender.com`). You will need it for the frontend.*

---

## 4. Step 2: Deploy Frontend (Vercel)
Vercel hosts static frontend builds for free with high performance.

1. Go to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Configure the project:
   * **Root Directory:** `client`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   * `VITE_API_BASE`: `https://your-api.onrender.com` *(Paste your Render Web Service URL. Do not add a trailing slash).*
6. Click **Deploy**.
7. Once deployment finishes, copy your assigned Vercel URL (e.g., `https://online-auction-system.vercel.app`).
8. *(Optional)* Go back to your **Render Environment Variables** and update `CORS_ORIGIN` to match your Vercel URL to secure the backend API.

---

## 5. Step 3: Keep-Alive Pinger (Crucial for node-cron & Socket.io)
### The Problem:
Render's free web services will **spin down (sleep) after 15 minutes of inactivity**. 
* While asleep, the **node-cron job will not run**, which means expired auctions will not close on time.
* The first visitor to the website after a sleep cycle will experience a **30 to 60-second delay** (cold start) while the API wakes up.

### The Solution ($0/month):
Configure a free external cron service to ping your backend's health check endpoint every 14 minutes. This prevents the server from entering sleep mode.

1. Go to [cron-job.org](https://cron-job.org/) and create a free account.
2. Click **Create Cronjob**.
3. Set the following options:
   * **Title:** `Keep Golden Hammer Alive`
   * **Address:** `https://your-api.onrender.com/health` *(Replace with your Render API URL)*
   * **Schedule:** `Every 14 minutes` (Custom: `*/14 * * * *`)
4. Click **Create**.

Your API will now stay awake 24/7. This uses `24 hours * (60 mins / 14 mins) = ~103 requests/day`, well within the free allowance of both Render (750 execution hours) and cron-job.org.

---

## 6. How Updates Work
Whenever you push changes to your `mainGold` branch on GitHub:
1. **Render** will automatically pull, install packages, compile the Prisma client, apply database migrations (`npx prisma migrate deploy`), and restart your API.
2. **Vercel** will automatically pull, build the production static files, and hot-swap the edge deployment.
